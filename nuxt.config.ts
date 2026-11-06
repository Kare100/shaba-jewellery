// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/image'],

  // Server-only secrets live in runtimeConfig; NUXT_DATABASE_URL overrides databaseUrl.
  // NUXT_PUBLIC_SITE_URL sets the canonical origin used in meta tags, JSON-LD and the sitemap.
  runtimeConfig: {
    databaseUrl: '',
    public: {
      siteUrl: 'http://localhost:3000',
      siteName: 'Shaba Jewellery',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en-KE' },
      titleTemplate: '%s | Shaba Jewellery',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#071814' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Italiana&family=Hanken+Grotesk:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  image: {
    // Serve modern formats; on Vercel @nuxt/image uses Vercel's image optimiser automatically.
    format: ['avif', 'webp'],
    quality: 75,
    screens: { xs: 320, sm: 640, md: 768, lg: 1024, xl: 1280 },
  },

  routeRules: {
    // Product pages change rarely: cache rendered HTML and revalidate in the background.
    '/': { swr: 600 },
    '/shop/**': { swr: 600 },
    '/products/**': { swr: 600 },
    // Cart and checkout are per-visitor; render them on the client and keep them out of search.
    '/cart': { ssr: false, headers: { 'X-Robots-Tag': 'noindex' } },
    '/checkout': { ssr: false, headers: { 'X-Robots-Tag': 'noindex' } },
    '/api/**': { headers: { 'cache-control': 'public, max-age=60, s-maxage=600' } },
  },

  // Three.js is only used inside client-side 3D components; pre-bundle it for a fast dev server.
  vite: {
    optimizeDeps: { include: ['three'] },
  },

  typescript: { strict: true },
})
