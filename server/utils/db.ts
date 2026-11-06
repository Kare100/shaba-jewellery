import { neon } from '@neondatabase/serverless'
import seedProducts from '../data/products.json'

// Neon's HTTP driver: each query is a single HTTPS request, with no connection to open or pool.
// That suits serverless functions on Vercel, which start and stop all the time.
type Sql = ReturnType<typeof neon>
let client: Sql | undefined
let ready: Promise<void> | undefined

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS products (
    id           SERIAL PRIMARY KEY,
    slug         TEXT        NOT NULL UNIQUE,
    sku          TEXT        NOT NULL UNIQUE,
    name         TEXT        NOT NULL,
    category     TEXT        NOT NULL CHECK (category IN ('rings', 'necklaces', 'earrings', 'bracelets')),
    short_description TEXT   NOT NULL,
    description  TEXT        NOT NULL,
    material     TEXT        NOT NULL,
    price_kes    INTEGER     NOT NULL CHECK (price_kes > 0),
    stock        INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image        TEXT        NOT NULL,
    image_alt    TEXT        NOT NULL,
    featured     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS products_category_idx ON products (category)`,
  // Remembers which version of server/data/products.json is loaded.
  `CREATE TABLE IF NOT EXISTS catalogue_meta (id INTEGER PRIMARY KEY, hash TEXT NOT NULL)`,
]

/** Small, stable fingerprint of the catalogue file (djb2). */
function fingerprint(value: unknown) {
  const text = JSON.stringify(value)
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
const CATALOGUE_HASH = fingerprint(seedProducts)

/**
 * Makes sure the database holds the current demo catalogue. On a warm database this costs one
 * query per server instance. On an empty one (a fresh deploy) it creates the tables and loads the
 * products, so no page ever renders empty. Editing products.json and redeploying updates the rows.
 */
async function ensureCatalogue(sql: Sql) {
  try {
    const rows = (await sql.query('SELECT hash FROM catalogue_meta WHERE id = 1')) as { hash: string }[]
    if (rows[0]?.hash === CATALOGUE_HASH) return
  } catch {
    // Tables don't exist yet; create them below.
  }
  for (const statement of SCHEMA) await sql.query(statement)

  for (const p of seedProducts) {
    await sql.query(
      `INSERT INTO products (slug, sku, name, category, short_description, description, material,
                             price_kes, stock, image, image_alt, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (slug) DO UPDATE SET
         sku = EXCLUDED.sku, name = EXCLUDED.name, category = EXCLUDED.category,
         short_description = EXCLUDED.short_description, description = EXCLUDED.description,
         material = EXCLUDED.material, price_kes = EXCLUDED.price_kes, stock = EXCLUDED.stock,
         image = EXCLUDED.image, image_alt = EXCLUDED.image_alt, featured = EXCLUDED.featured,
         updated_at = now()`,
      [p.slug, p.sku, p.name, p.category, p.short_description, p.description, p.material,
        p.price_kes, p.stock, p.image, p.image_alt, p.featured],
    )
  }
  // Drop products that are no longer in the catalogue file.
  await sql.query('DELETE FROM products WHERE NOT (slug = ANY($1))', [seedProducts.map((p) => p.slug)])
  await sql.query(
    'INSERT INTO catalogue_meta (id, hash) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET hash = EXCLUDED.hash',
    [CATALOGUE_HASH],
  )
}

export async function useDb(): Promise<Sql> {
  if (!client) {
    // NUXT_DATABASE_URL, or DATABASE_URL as set by Vercel's Neon integration.
    const databaseUrl = useRuntimeConfig().databaseUrl || process.env.DATABASE_URL
    if (!databaseUrl) {
      throw createError({ statusCode: 500, statusMessage: 'Database is not configured' })
    }
    client = neon(databaseUrl)
  }
  ready ??= ensureCatalogue(client).catch((err) => {
    ready = undefined // try again on the next request
    throw err
  })
  await ready
  return client
}

/** Columns every product query returns, renamed to the camelCase fields of the Product type. */
export const PRODUCT_COLUMNS = `
  id, slug, sku, name, category,
  short_description AS "shortDescription", description, material,
  price_kes AS "priceKes", stock, image, image_alt AS "imageAlt", featured,
  updated_at AS "updatedAt"`
