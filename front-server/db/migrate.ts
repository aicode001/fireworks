import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { Database } from 'bun:sqlite'

const sqlite = new Database('./data.db')
const db = drizzle(sqlite)

console.log('🔄 Running database migrations...')

try {
    // Drizzle's migrate function automatically:
    // 1. Creates __drizzle_migrations table to track executed migrations
    // 2. Only runs migrations that haven't been executed yet
    // 3. Executes migrations in order
    migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Database migrations completed successfully!')
} catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
} finally {
    sqlite.close()
}
