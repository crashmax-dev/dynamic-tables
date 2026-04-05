import fs from 'node:fs'
import { createClient } from '@hey-api/openapi-ts'
import type { UserConfig } from '@hey-api/openapi-ts'
import type { Plugin } from 'vite'

const PLUGIN_NAME = 'hey-api-plugin'

interface RetryOptions {
  /**
   * Maximum number of attempts to reach the URL before skipping client generation.
   * @default 5
   */
  attempts?: number

  /**
   * Delay between attempts in milliseconds.
   * @default 1000
   */
  delay?: number

  /**
   * Timeout for a single request in milliseconds.
   * @default 5000
   */
  timeout?: number
}

interface HeyApiPluginOptions {
  /**
   * `@hey-api/openapi-ts` configuration options.
   */
  config?: UserConfig

  /**
   * Retry options used when `config.input` is a URL that is not immediately reachable.
   */
  retry?: RetryOptions
}

function isUrl(input: string) {
  try {
    const url = new URL(input)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isFilePath(input: string) {
  if (!fs.existsSync(input)) return false
  return fs.statSync(input).isFile()
}

function resolveInputString(input: UserConfig['input']) {
  if (typeof input !== 'string') {
    throw new TypeError(`[${PLUGIN_NAME}] Input must be a string`)
  }
  return input
}

async function waitForUrl(
  url: string,
  retry: Required<RetryOptions>,
): Promise<boolean> {
  for (let i = 1; i <= retry.attempts; i++) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(retry.timeout),
      })
      if (response.ok) {
        console.log(`[${PLUGIN_NAME}] URL is reachable: ${url} (attempt ${i}/${retry.attempts})`)
        return true
      }
    } catch {
      console.warn(`[${PLUGIN_NAME}] Attempt ${i}/${retry.attempts} failed — URL is not reachable: ${url}`)
    }

    if (i < retry.attempts) {
      await new Promise((resolve) => setTimeout(resolve, retry.delay))
    }
  }

  return false
}

export function heyApiPlugin(options?: HeyApiPluginOptions): Plugin {
  const retry: Required<RetryOptions> = {
    attempts: options?.retry?.attempts ?? 5,
    delay: options?.retry?.delay ?? 1000,
    timeout: options?.retry?.timeout ?? 5000,
  }

  async function setupClient() {
    if (options?.config?.input) {
      const input = resolveInputString(options.config.input)
      if (!isUrl(input)) return

      const isAvailable = await waitForUrl(input, retry)
      if (!isAvailable) {
        const message = `[${PLUGIN_NAME}] URL is not reachable after ${retry.attempts} attempt(s): ${input}. Skipping client generation.`
        console.error(message)
        return
      }
    }

    await createClient(options?.config)
  }

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    configResolved(resolvedConfig) {
      if (resolvedConfig.command === 'build') return
      setupClient()
    },
    configureServer(server) {
      let watcherCleanup: (() => void) | undefined

      const setup = () => {
        if (!options?.config?.input) return
        const input = resolveInputString(options.config.input)
        if (!isFilePath(input)) return

        console.log(`[${PLUGIN_NAME}] Watching for changes: ${input}`)

        const watcher = fs.watch(input, { persistent: false }, async (eventType) => {
          if (eventType !== 'change') return
          console.log(`[${PLUGIN_NAME}] Input file changed, regenerating client...`)
          try {
            await createClient(options.config)
            server.ws.send({ type: 'full-reload' })
          } catch (error) {
            console.error(`[${PLUGIN_NAME}] Failed to regenerate client:`, error)
          }
        })

        watcherCleanup = () => watcher.close()
      }

      setup()

      server.httpServer?.once('close', () => watcherCleanup?.())
    },
  }
}
