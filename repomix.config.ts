import { defineConfig } from 'repomix'

export default defineConfig({
  output: {
    style: 'markdown',
    fileSummary: false,
    tokenCountTree: true,
    removeComments: true,
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
      'api/db/migrations',
    ],
    useGitignore: true,
  },
})
