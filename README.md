# Shaba Jewellery: Nuxt 3 demo store

A small online store for a fictional Nairobi jewellery shop, built as a take-home project.

- **Live site:** _add your Vercel URL here_
- **Stack:** Nuxt 3 (TypeScript), Tailwind CSS, `@nuxt/image`, Three.js, Nuxt server routes (Nitro), PostgreSQL on Neon, deployed on Vercel

## Design

The look is the inside of a jewellery box: deep green velvet (after tsavorite, the green garnet first found in Tsavo), champagne metal for anything you can click, a thin Didone display face (Italiana) with Hanken Grotesk for text, and a light film grain over everything.

- **Live 3D jewellery (Three.js).** The home page opens on a gold tsavorite ring turning under a spotlight in front of the shop's name. It follows the pointer and turns and lifts as you scroll. Every product page has a 3D model you can drag to turn. The models are built in code from simple shapes (`lib/jewel-scene.ts`, configured per product in `shared/jewels.ts`), so there are no model files to download. They use physically based metal, transmissive gemstones with dispersion, and iridescent pearls, lit by an environment map.
- **Performance first.** Three.js loads in its own chunk only after the page has rendered, inside client-only components. Product pages render the photo in the server HTML (good for SEO and LCP), and the 3D model fades in over it. If WebGL isn't available, the photo stays. Rendering pauses when the canvas is off screen.
- **Motion with restraint.** There's one opening sequence on the home page (the light comes up, the name settles, the copy arrives). Product tiles tilt toward the pointer with a glare that follows it. `prefers-reduced-motion` turns off the grain, the opening sequence, auto-rotation and tilt.

## Features

| Page | URL | Notes |
| --- | --- | --- |
| Home | `/` | Hero, categories, featured products |
| Shop all | `/shop` | Full catalogue, sort by price |
| Category | `/shop/rings`, `/shop/necklaces`, … | Unknown categories return a real 404 |
| Product detail | `/products/amani-solitaire-ring` | Price, stock, quantity, add to cart, related items |
| Cart | `/cart` | Change quantities, remove items, delivery fee rule |
| Checkout | `/checkout` | **Mocked**: validates a Kenyan phone number and shows a confirmation; no payment is taken |

API: `GET /api/products` (optional `?category=` and `?featured=1`) and `GET /api/products/:slug`.

## SEO checklist

- **Unique titles and meta descriptions on every page.** Product pages use the name and price in the title and the product's `short_description` column as the meta description. `titleTemplate` adds the brand name.
- **Canonical URL** on every page, built from `NUXT_PUBLIC_SITE_URL`.
- **Open Graph and Twitter cards** (title, description, URL, image, alt text, locale), plus `product:price:*` tags on product pages. All of this is set in one composable (`composables/usePageSeo.ts`), so pages can't miss a tag.
- **Structured data (JSON-LD):** `Product` + `Offer` (price in KES, availability from stock, SKU, brand) and `BreadcrumbList` on product pages, `ItemList` on listing pages, and `Organization` + `WebSite` on the home page. See `composables/useStructuredData.ts`.
- **Sitemap:** `/sitemap.xml` is generated from the database, so new products appear automatically, with `<lastmod>` taken from `updated_at`.
- **robots.txt:** `/robots.txt` points to the sitemap and blocks `/cart`, `/checkout` and `/api/`.
- **Clean URLs:** `/shop/<category>` and `/products/<slug>`, with no IDs or query strings. Slugs are unique in the database.
- **Server-side rendering:** product content is in the HTML on first load, so crawlers don't need to run JavaScript. Pages are cached with stale-while-revalidate (`routeRules`).
- **noindex** on cart, checkout and error pages.
- **Semantic HTML:** one `h1` per page, breadcrumbs, `lang="en-KE"`, alt text stored per product.

## Image handling

- Every image goes through `<NuxtImg>`. On Vercel, this uses Vercel's image optimiser to serve AVIF/WebP at the size each screen needs (`sizes`, `srcset`).
- Width and height are always set, so the layout doesn't jump while images load (CLS).
- The main product image is preloaded with `fetchpriority="high"` because it is the Largest Contentful Paint (LCP) element. Images below the fold use `loading="lazy"`.
- Source files are small WebP images (about 6–45 KB each).

> The product photos are generated illustrations, used as placeholders because the shop is fictional. To use real photos, replace the files in `public/images/products/` and keep the same names.

## Run locally

Requirements: Node 20.6+ and a free [Neon](https://neon.tech) Postgres database. The HTTP driver talks to Neon, not to a local Postgres server.

```bash
npm install
cp .env.example .env        # then set NUXT_DATABASE_URL
npm run db:setup            # creates the table and loads 12 demo products
npm run dev                 # http://localhost:3000
```

## Deploy (Vercel + Neon)

1. Import the GitHub repo into Vercel. It detects Nuxt automatically.
2. In the Vercel project, go to **Storage** and add a **Neon** database. This sets `DATABASE_URL` for you. (Or set `NUXT_DATABASE_URL` yourself.)
3. Load the data: run `npm run db:setup` against that database, or paste `db/schema.sql` and then `db/seed.sql` into Neon's SQL editor.
4. Set `NUXT_PUBLIC_SITE_URL` to the site's URL, e.g. `https://shaba-jewellery.vercel.app` (no trailing slash).
5. Deploy, then check `/sitemap.xml` and run a product URL through Google's [Rich Results Test](https://search.google.com/test/rich-results).

## Project structure

```
pages/            index, shop/index, shop/[category], products/[slug], cart, checkout
components/       AppHeader, AppFooter, ProductCard (tilt), ProductListing, JewelCanvas.client (3D)
lib/jewel-scene.ts  Three.js scene: procedural models, materials, lighting, controls
composables/      useCart (cart state), usePageSeo + useJsonLd, useStructuredData
plugins/          cart.client.ts (saves the cart to localStorage)
server/api/       products list + product by slug
server/routes/    sitemap.xml, robots.txt
server/utils/db.ts  shared Postgres client
shared/types.ts   Product type and categories (used by both client and server)
shared/jewels.ts  which 3D model, metal and stone each product uses
db/               schema.sql, seed.sql
```

## Key decisions

- **Nuxt server routes instead of a separate backend.** The brief asks for a simple backend. Running it inside the same Nuxt app means one repo, one deploy and shared TypeScript types. If the API grew, I'd move it to NestJS.
- **PostgreSQL with raw SQL through Neon's HTTP driver, no ORM.** With one table, an ORM adds more setup than it saves. The HTTP driver sends each query as one HTTPS request, so serverless functions never run out of database connections. Every query is parameterised. `price_kes` is stored as an integer because floats shouldn't be used for money.
- **Cart in `useState` + `localStorage`, not in the database.** This keeps checkout mockable with no accounts or sessions. Cart and checkout are client-rendered and set to noindex because they're different for every visitor.
- **SEO lives in composables**, so every page gets the full set of meta tags, canonical URL and JSON-LD from one place.
- **A small Tailwind theme** (`velvet`, `champagne`, `tsavorite`, `mist`, plus a display type scale) and a few shared classes (`.btn-primary`, `.btn-ghost`, `.input`, `.container-page`) keep styling consistent.
- **Procedural 3D instead of downloaded models.** Twelve glTF models would weigh megabytes and need a 3D artist. Building each piece from tori, lathes and instanced spheres keeps the whole 3D layer to the Three.js chunk plus a few KB of code.

## AI usage

_Write your own 3–5 sentences here before submitting. Say what the AI produced and what you decided, reviewed or changed yourself._
