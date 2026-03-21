import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

const client = postgres(connectionString, {
  max: 10,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : undefined,
})

export const db = drizzle(client, { schema })

export type DB = typeof db
