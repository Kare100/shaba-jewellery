// Restores the cart from localStorage on first load, then keeps localStorage in sync.
// Client-only (.client.ts) because localStorage does not exist during server rendering.
export default defineNuxtPlugin(() => {
  const { items, hydrated, STORAGE_KEY } = useCart()

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) items.value = JSON.parse(saved)
  } catch {
    // Private browsing or corrupted data: start with an empty cart.
  }
  hydrated.value = true

  watch(
    items,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* storage full or blocked; the cart still works for this visit */
      }
    },
    { deep: true },
  )
})
