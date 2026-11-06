import type { Product } from '../../../shared/types'

// GET /api/products/:slug -> one product, or 404
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const rows = (await (await useDb()).query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE slug = $1`, [slug])) as Product[]
  const product = rows[0]
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }
  return product
})
