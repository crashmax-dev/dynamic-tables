import { loadEnvFile } from 'node:process'
import { defineConfig } from 'drizzle-kit'

loadEnvFile('.env')

export default defineConfig({
  schema: './api/db/schema.ts',
  out: './api/db/migrations',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
