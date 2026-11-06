import type { MaybeRefOrGetter } from 'vue'
import { PHOTOS, photoUrl } from '~~/shared/photos'

interface PageSeo {
  title: string
  description: string
  /** Path only, e.g. "/products/amani-solitaire-ring" */
  path: string
  /** Unsplash photo path or absolute URL */
  image?: string
  imageAlt?: string
  noindex?: boolean
}

// One place that sets the title, meta description, canonical link and Open Graph / Twitter tags,
// so every page gets the full set and none can drift out of sync.
export function usePageSeo(seo: MaybeRefOrGetter<PageSeo>) {
  const { siteUrl, siteName } = useRuntimeConfig().public
  const s = computed(() => toValue(seo))
  const url = computed(() => `${siteUrl}${s.value.path === '/' ? '' : s.value.path}`)
  const image = computed(() => {
    // Product photos are Unsplash paths; turn them into a 1200x630 crop for social cards.
    return photoUrl(s.value.image ?? PHOTOS.hero.src)
  })
  const fullTitle = computed(() => `${s.value.title} | ${siteName}`)

  useSeoMeta({
    title: () => s.value.title,
    description: () => s.value.description,
    robots: () => (s.value.noindex ? 'noindex, nofollow' : 'index, follow'),
    ogTitle: () => fullTitle.value,
    ogDescription: () => s.value.description,
    ogUrl: () => url.value,
    ogType: 'website',
    ogImage: () => image.value,
    ogImageAlt: () => s.value.imageAlt ?? siteName,
    ogSiteName: siteName,
    ogLocale: 'en_KE',
    twitterCard: 'summary_large_image',
    twitterTitle: () => fullTitle.value,
    twitterDescription: () => s.value.description,
    twitterImage: () => image.value,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })
}

/** Adds a JSON-LD block (structured data) to the page head. */
export function useJsonLd(data: MaybeRefOrGetter<Record<string, unknown> | null | undefined>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        // Escape "<" so product text can never close the script tag early.
        innerHTML: computed(() => {
          const value = toValue(data)
          return value ? JSON.stringify(value).replace(/</g, '\\u003c') : ''
        }),
      },
    ],
  })
}
