import type { Product } from '~~/shared/types'

export interface CartItem {
  slug: string
  name: string
  priceKes: number
  image: string
  imageAlt: string
  qty: number
  stock: number
}

const STORAGE_KEY = 'shaba-cart-v1'

// Cart state lives in useState so every component shares one cart.
// It is mirrored to localStorage on the client so it survives a refresh (see plugins/cart.client.ts).
export function useCart() {
  const items = useState<CartItem[]>('cart', () => [])
  const hydrated = useState<boolean>('cart-hydrated', () => false)

  const count = computed(() => items.value.reduce((n, i) => n + i.qty, 0))
  const subtotal = computed(() => items.value.reduce((sum, i) => sum + i.priceKes * i.qty, 0))

  function add(product: Product, qty = 1) {
    const existing = items.value.find((i) => i.slug === product.slug)
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, product.stock)
    } else {
      items.value.push({
        slug: product.slug,
        name: product.name,
        priceKes: product.priceKes,
        image: product.image,
        imageAlt: product.imageAlt,
        qty: Math.min(qty, product.stock),
        stock: product.stock,
      })
    }
  }

  function setQty(slug: string, qty: number) {
    const item = items.value.find((i) => i.slug === slug)
    if (!item) return
    if (qty <= 0) return remove(slug)
    item.qty = Math.min(Math.floor(qty), item.stock)
  }

  function remove(slug: string) {
    items.value = items.value.filter((i) => i.slug !== slug)
  }

  function clear() {
    items.value = []
  }

  return { items, hydrated, count, subtotal, add, setQty, remove, clear, STORAGE_KEY }
}
