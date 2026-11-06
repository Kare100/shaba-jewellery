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
  rings: { label: 'Rings', blurb: 'Solitaires, halo rings and signets, set by hand in 18k gold vermeil.' },
  necklaces: { label: 'Necklaces', blurb: 'Fine pendants, rope chains and hand-knotted freshwater pearls.' },
  earrings: { label: 'Earrings', blurb: 'Bold hoops, everyday huggies and filigree drops.' },
  bracelets: { label: 'Bracelets', blurb: 'Engravable ID bracelets, fine charm chains and bold links.' },
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}
