import { neon } from '@neondatabase/serverless'

// Neon's HTTP driver: each query is a single HTTPS request, with no connection to open or pool.
// That suits serverless functions on Vercel, which start and stop all the time.
let client: ReturnType<typeof neon> | undefined

export function useDb() {
  if (!client) {
    // NUXT_DATABASE_URL, or DATABASE_URL as set by Vercel's Neon integration.
    const databaseUrl = useRuntimeConfig().databaseUrl || process.env.DATABASE_URL
    if (!databaseUrl) {
      throw createError({ statusCode: 500, statusMessage: 'Database is not configured' })
    }
    client = neon(databaseUrl)
  }
  return client
}

/** Columns every product query returns, renamed to the camelCase fields of the Product type. */
export const PRODUCT_COLUMNS = `
  id, slug, sku, name, category,
  short_description AS "shortDescription", description, material,
  price_kes AS "priceKes", stock, image, image_alt AS "imageAlt", featured,
  updated_at AS "updatedAt"`
