# Shaba Jewellery: Nuxt 3 demo store

A small online store for a fictional Nairobi jewellery shop, built as a take-home project.

- **Live site:** _add your Vercel URL here_
- **Stack:** Nuxt 3 (TypeScript), Tailwind CSS, `@nuxt/image`, Nuxt server routes (Nitro), PostgreSQL on Neon, deployed on Vercel

## Design

The design follows how leading fine-jewellery shops (Mejuri, Monica Vinader, Catbird) present their pieces: real photography edge to edge, soft paper and stone backgrounds that photograph gold warmly, near-black type, small tracked labels, and a muted gold used only for accents. Gilda Display is used for headings and Jost for text.

- **Real photography.** Product and lifestyle photos come from [Unsplash](https://unsplash.com) (free for commercial use under the Unsplash License). The photo for each product is chosen to match its name and description.
- **Cinematic, not gimmicky.** The home page opens on a full-bleed photo that settles from a slow push-in, with a gentle parallax as you scroll. The editorial image opens like a curtain the first time it comes into view. Product photos zoom like a loupe under the mouse. Product tiles reveal a "Quick add" button on hover. `prefers-reduced-motion` turns all of this off.
- **Familiar shop patterns.** Announcement ticker, centred wordmark, transparent header over photos that turns solid on scroll, category banners, a sticky filter and sort bar, a product gallery with thumbnails, and accordions for details, care and delivery.

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

- Every image goes through `<NuxtImg>` with the Unsplash provider. It asks Unsplash's image CDN for each photo at exactly the width the layout needs, in WebP, with a `srcset` for each screen size. A full-size photo is never downloaded.
- Width and height are always set, so the layout doesn't jump while images load (CLS).
- The main product image is preloaded with `fetchpriority="high"` because it is the Largest Contentful Paint (LCP) element. Images below the fold use `loading="lazy"`.
- The browser connects to the image CDN early (`preconnect`).


## Run locally

Requirements: Node 20.6+ and a free [Neon](https://neon.tech) Postgres database. The HTTP driver talks to Neon, not to a local Postgres server.

```bash
npm install
cp .env.example .env        # then set NUXT_DATABASE_URL
npm run dev                 # http://localhost:3000

The database sets itself up: on the first request, the server creates the tables and loads the catalogue from `server/data/products.json`.
```

## Deploy (Vercel + Neon)

1. Import the GitHub repo into Vercel. It detects Nuxt automatically.
2. In the Vercel project, go to **Storage** and add a **Neon** database. This sets `DATABASE_URL` for you. (Or set `NUXT_DATABASE_URL` yourself.)
3. Set `NUXT_PUBLIC_SITE_URL` to the site's URL, e.g. `https://shaba-jewellery.vercel.app` (no trailing slash).
4. Deploy, then check `/sitemap.xml` and run a product URL through Google's [Rich Results Test](https://search.google.com/test/rich-results).

## Project structure

```
pages/            index, shop/index, shop/[category], products/[slug], cart, checkout
components/       AppHeader, AppFooter, ProductCard, ProductListing
composables/      useCart (cart state), usePageSeo + useJsonLd, useStructuredData
plugins/          cart.client.ts (saves the cart to localStorage)
server/api/       products list + product by slug
server/routes/    sitemap.xml, robots.txt
server/utils/db.ts  shared Postgres client
shared/types.ts   Product type and categories (used by both client and server)
shared/photos.ts  hero, editorial and category photos
server/data/products.json  the catalogue (loaded into Postgres automatically)
```

## Key decisions

- **Nuxt server routes instead of a separate backend.** The brief asks for a simple backend. Running it inside the same Nuxt app means one repo, one deploy and shared TypeScript types. If the API grew, I'd move it to NestJS.
- **PostgreSQL with raw SQL through Neon's HTTP driver, no ORM.** With one table, an ORM adds more setup than it saves. The HTTP driver sends each query as one HTTPS request, so serverless functions never run out of database connections. Every query is parameterised. `price_kes` is stored as an integer because floats shouldn't be used for money.
- **Cart in `useState` + `localStorage`, not in the database.** This keeps checkout mockable with no accounts or sessions. Cart and checkout are client-rendered and set to noindex because they're different for every visitor.
- **SEO lives in composables**, so every page gets the full set of meta tags, canonical URL and JSON-LD from one place.
- **A small Tailwind theme** (`paper`, `stone`, `ink`, `gold`, plus a display type scale) and a few shared classes (`.btn-primary`, `.btn-outline`, `.label`, `.link-underline`, `.input`, `.container-page`) keep styling consistent.
- **A database that sets itself up.** On first use, each server instance checks a fingerprint of `products.json` against the database (one query). If the fingerprint is missing or has changed, the server creates the tables and upserts the products. A fresh deploy can never show empty pages, and there's no manual seeding step.

## AI usage

_Write your own 3–5 sentences here before submitting. Say what the AI produced and what you decided, reviewed or changed yourself._
