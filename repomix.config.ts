import { defineConfig } from 'repomix'

export default defineConfig({
  output: {
    style: 'markdown',
    headerText: 'Components located at `src/components/ui` are shadcn-vue components. Do not modify them directly — treat them as a third-party UI library. When building features, import and compose these primitives rather than creating replacements.',
    tokenCountTree: true,
    removeComments: true,
    copyToClipboard: true,
    directoryStructure: true,
  },
  security: {
    enableSecurityCheck: true,
  },
  include: [
    'src',
    'api',
    'package.json',
    'vite.config.ts',
    'drizzle.config.ts',
  ],
  ignore: {
    customPatterns: [
      'src/components/ui',
      'api/db/migrations',
    ],
    useGitignore: true,
  },
})
