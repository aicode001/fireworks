import { Database } from 'bun:sqlite'

const db = new Database('./data.db')

// Create the Drizzle migrations table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        created_at NUMERIC
    )
`)

// Mark the first migration as executed
// The hash is typically the filename without extension, but Drizzle may use different format
// We'll insert with the migration filename hash
const migrationHash = '0000_mysterious_dark_phoenix'
const timestamp = Date.now()

db.run(`INSERT OR IGNORE INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)`, [migrationHash, timestamp])

console.log('✅ Marked first migration as executed')
console.log('📋 Current migrations:')
console.log(db.query('SELECT * FROM __drizzle_migrations').all())

db.close()
