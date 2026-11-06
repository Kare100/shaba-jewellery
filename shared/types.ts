export const CATEGORIES = ['rings', 'necklaces', 'earrings', 'bracelets'] as const
export type Category = (typeof CATEGORIES)[number]

export interface Product {
  id: number
  slug: string
  sku: string
  name: string
  category: Category
  shortDescription: string
  description: string
  material: string
  priceKes: number
  stock: number
  image: string
  imageAlt: string
  featured: boolean
  updatedAt: string
}

export const CATEGORY_INFO: Record<Category, { label: string; blurb: string }> = {
  rings: { label: 'Rings', blurb: 'Solitaires, stackers and signets in silver and gold vermeil.' },
  necklaces: { label: 'Necklaces', blurb: 'Pendants, pearls and hand-beaded collars made in Kenya.' },
  earrings: { label: 'Earrings', blurb: 'Studs, drops and hammered copper hoops for every day.' },
  bracelets: { label: 'Bracelets', blurb: 'Tennis bracelets, stone beads and engraved brass cuffs.' },
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}
