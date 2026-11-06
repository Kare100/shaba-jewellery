import { isCategory, type Product } from '../../../shared/types'

// GET /api/products            -> all products
// GET /api/products?category=x -> one category
// GET /api/products?featured=1 -> homepage picks
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = typeof query.category === 'string' ? query.category : null
  const featured = query.featured === '1' || query.featured === 'true'

  if (category && !isCategory(category)) {
    throw createError({ statusCode: 400, statusMessage: `Unknown category: ${category}` })
  }

  // Values go in as $1/$2 parameters, never pasted into the SQL text, so this is safe from injection.
  const rows = await useDb().query(
    `SELECT ${PRODUCT_COLUMNS}
     FROM products
     WHERE ($1::text IS NULL OR category = $1)
       AND ($2::boolean = FALSE OR featured = TRUE)
     ORDER BY featured DESC, created_at, id`,
    [category, featured],
  )
  return rows as Product[]
})
