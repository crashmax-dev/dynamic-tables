import { defineConfig } from 'repomix'

export default defineConfig({
  output: {
    style: 'markdown',
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
