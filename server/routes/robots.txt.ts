// GET /robots.txt: lets crawlers in, keeps cart/checkout/API out, and points to the sitemap.
export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
