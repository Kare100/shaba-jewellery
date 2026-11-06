import { CATEGORIES } from '../../shared/types'

// GET /sitemap.xml, built from the database so new products appear automatically.
export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig().public
  const products = (await (await useDb()).query(
    'SELECT slug, updated_at AS "updatedAt" FROM products ORDER BY id',
  )) as { slug: string; updatedAt: string }[]

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' },
    { loc: '/shop' },
    ...CATEGORIES.map((c) => ({ loc: `/shop/${c}` })),
    ...products.map((p) => ({
      loc: `/products/${p.slug}`,
      lastmod: new Date(p.updatedAt).toISOString().slice(0, 10),
    })),
  ]

  const body = urls
    .map((u) => `  <url><loc>${siteUrl}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
})
