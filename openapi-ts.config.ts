import { loadEnvFile } from 'node:process'
import { defineConfig } from '@hey-api/openapi-ts'
import type { UserConfig } from '@hey-api/openapi-ts'

loadEnvFile('.env')

export const heyApiConfig: UserConfig = {
  input: `http://localhost:${process.env.API_PORT}/openapi.json`,
  output: {
    path: 'src/api',
    preferExportAll: true,
  },
  logs: {
    file: false,
  },
  plugins: [
    {
      name: '@hey-api/sdk',
      auth: false,
    },
    {
      name: '@hey-api/client-fetch',
      throwOnError: true,
    },
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
      case: 'PascalCase',
    },
  ],
}

export default defineConfig(heyApiConfig)
