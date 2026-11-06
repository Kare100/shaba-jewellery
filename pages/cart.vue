<script setup lang="ts">
const { items, count, subtotal, setQty, remove, hydrated } = useCart()

const FREE_DELIVERY_FROM = 5000
const DELIVERY_FEE = 300
const delivery = computed(() => (subtotal.value >= FREE_DELIVERY_FROM || subtotal.value === 0 ? 0 : DELIVERY_FEE))
const total = computed(() => subtotal.value + delivery.value)

usePageSeo({
  title: 'Your Cart',
  description: 'Review the pieces in your Shaba Jewellery cart before checkout.',
  path: '/cart',
  noindex: true,
})
</script>

<template>
  <div class="container-page pb-10 pt-32 sm:pt-36">
    <h1 class="text-display-sm text-mist">Your cart</h1>

    <p v-if="!hydrated" class="mt-8 text-mist/50">Loading your cart…</p>

    <div v-else-if="count === 0" class="mt-8 rounded-[3px] bg-velvet-soft p-10 text-center">
      <p class="text-lg">Your cart is empty.</p>
      <NuxtLink to="/shop" class="btn-primary mt-6">Browse the collection</NuxtLink>
    </div>

    <div v-else class="mt-8 grid gap-10 lg:grid-cols-[1fr,360px]">
      <ul class="divide-y divide-mist/10 border-y border-mist/10">
        <li v-for="item in items" :key="item.slug" class="flex gap-4 py-5">
          <NuxtLink :to="`/products/${item.slug}`" class="shrink-0">
            <NuxtImg :src="item.image" :alt="item.imageAlt" width="112" height="112" class="h-24 w-24 rounded-[3px] bg-velvet-soft object-cover sm:h-28 sm:w-28" />
          </NuxtLink>
          <div class="flex flex-1 flex-col">
            <div class="flex justify-between gap-4">
              <NuxtLink :to="`/products/${item.slug}`" class="font-display text-xl hover:text-champagne">{{ item.name }}</NuxtLink>
              <p class="font-medium">{{ formatKes(item.priceKes * item.qty) }}</p>
            </div>
            <p class="text-sm text-mist/50">{{ formatKes(item.priceKes) }} each</p>
            <div class="mt-auto flex items-center gap-4 pt-3">
              <div class="flex items-center rounded-full border border-mist/20 text-sm">
                <button class="px-3 py-1.5" :aria-label="`Decrease quantity of ${item.name}`" @click="setQty(item.slug, item.qty - 1)">−</button>
                <span class="w-8 text-center" aria-live="polite">{{ item.qty }}</span>
                <button
                  class="px-3 py-1.5"
                  :aria-label="`Increase quantity of ${item.name}`"
                  :disabled="item.qty >= item.stock"
                  @click="setQty(item.slug, item.qty + 1)"
                >+</button>
              </div>
              <button class="text-sm text-mist/50 underline hover:text-red-400" @click="remove(item.slug)">Remove</button>
            </div>
          </div>
        </li>
      </ul>

      <aside class="h-fit rounded-[3px] bg-velvet-soft p-6" aria-label="Order summary">
        <h2 class="text-3xl">Summary</h2>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between"><dt>Subtotal ({{ count }} items)</dt><dd>{{ formatKes(subtotal) }}</dd></div>
          <div class="flex justify-between"><dt>Delivery (Nairobi)</dt><dd>{{ delivery === 0 ? 'Free' : formatKes(delivery) }}</dd></div>
          <div class="flex justify-between border-t border-mist/10 pt-3 text-base font-semibold"><dt>Total</dt><dd>{{ formatKes(total) }}</dd></div>
        </dl>
        <p v-if="delivery > 0" class="mt-3 text-xs text-mist/50">
          Add {{ formatKes(FREE_DELIVERY_FROM - subtotal) }} more for free delivery.
        </p>
        <NuxtLink to="/checkout" class="btn-primary mt-6 w-full">Checkout</NuxtLink>
      </aside>
    </div>
  </div>
</template>
