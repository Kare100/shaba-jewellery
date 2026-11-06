// Creates the schema and loads the demo catalogue.
// Usage: npm run db:setup   (reads NUXT_DATABASE_URL or DATABASE_URL from .env)
import { readFile } from 'node:fs/promises'
import { neon } from '@neondatabase/serverless'

const url = process.env.NUXT_DATABASE_URL || process.env.DATABASE_URL
if (!url) {
  console.error('NUXT_DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
  process.exit(1)
}
const sql = neon(url)

for (const file of ['db/schema.sql', 'db/seed.sql']) {
  // The HTTP driver runs one statement per request, so split each file on the semicolons that end a statement.
  const text = (await readFile(file, 'utf8')).replace(/^--.*$/gm, '')
  const statements = text.split(/;\s*$/m).map((s) => s.trim()).filter(Boolean)
  for (const statement of statements) await sql.query(statement)
  console.log(`ran ${file} (${statements.length} statements)`)
}
const [{ count }] = await sql.query('SELECT count(*)::int AS count FROM products')
console.log(`done: ${count} products`)
