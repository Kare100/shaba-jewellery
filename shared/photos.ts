import type { Category } from './types'

// Editorial photography from Unsplash (free to use under the Unsplash License).
// Paths are relative to images.unsplash.com; @nuxt/image's Unsplash provider resizes them on Unsplash's CDN.
export const PHOTOS = {
  hero: { src: '/photo-1731406322264-dac59f83828b', alt: 'Woman wearing layered gold necklaces and stacked gold rings' },
  editorial: { src: '/photo-1633934542430-0905ccb5f050', alt: 'Hands with gold rings resting against a white shirt and a fine gold necklace' },
}

export const CATEGORY_PHOTOS: Record<Category, { src: string; alt: string }> = {
  rings: { src: '/photo-1628926379972-9843ad139a8c', alt: 'Two gold wedding bands beside dried flowers' },
  necklaces: { src: '/photo-1727252586975-578c9122ec95', alt: 'Close-up of a fine gold chain necklace being worn' },
  earrings: { src: '/photo-1671644730555-916aa8d8157f', alt: 'Close-up of an ear wearing a small gold earring' },
  bracelets: { src: '/photo-1775212429587-82779c6f8775', alt: 'Wrist wearing a delicate gold bracelet' },
}

/** Absolute Unsplash URL, for places that need a full URL (Open Graph, JSON-LD). */
export function photoUrl(src: string, w = 1200, h = 630) {
  if (src.startsWith('http')) return src
  return `https://images.unsplash.com${src}?w=${w}&h=${h}&fit=crop&crop=entropy&q=80&fm=jpg`
}
