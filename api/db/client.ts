import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.ts'

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

const client = new Pool({
  max: 10,
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production',
})

export const db = drizzle(client, {
  schema,
  casing: 'snake_case',
})
