import { Database } from 'bun:sqlite'
import { readFileSync } from 'fs'
import { join } from 'path'

const db = new Database('./data.db')

// Read and execute the migration SQL
const migrationSQL = readFileSync(join(import.meta.dir, '../drizzle/0000_mysterious_dark_phoenix.sql'), 'utf-8')

// Split by semicolons and execute each statement
const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

console.log('🔄 Running migrations...')

for (const statement of statements) {
    try {
        db.run(statement)
    } catch (error) {
        console.error('Error executing statement:', statement)
        throw error
    }
}

console.log('✅ Migrations completed successfully!')
db.close()
