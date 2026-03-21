import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!
const migrationClient = postgres(connectionString, { max: 1 })
const db = drizzle(migrationClient)

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './api/db/migrations' })
  console.log('Migrations done!')
  await migrationClient.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
