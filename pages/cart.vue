<script setup lang="ts">
const { items, count, subtotal, setQty, remove, hydrated } = useCart()

const FREE_DELIVERY_FROM = 5000
const DELIVERY_FEE = 300
const delivery = computed(() => (subtotal.value >= FREE_DELIVERY_FROM || subtotal.value === 0 ? 0 : DELIVERY_FEE))
const total = computed(() => subtotal.value + delivery.value)
const toFree = computed(() => Math.max(FREE_DELIVERY_FROM - subtotal.value, 0))

usePageSeo({
  title: 'Your Bag',
  description: 'Review the pieces in your Shaba Jewellery bag before checkout.',
  path: '/cart',
  noindex: true,
})
</script>

<template>
  <div class="container-page pb-10 pt-36 sm:pt-44">
    <h1 class="text-display-md">Your bag</h1>

    <p v-if="!hydrated" class="mt-10 text-ink-soft">Loading your bag…</p>

    <div v-else-if="count === 0" class="mt-10 bg-stone px-6 py-16 text-center">
      <p class="font-display text-2xl">Your bag is empty</p>
      <p class="mt-2 text-sm text-ink-soft">Start with our most-loved hoops, or browse everything.</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/products/shaba-bold-hoops" class="btn-primary">Shop the Bold Hoops</NuxtLink>
        <NuxtLink to="/shop" class="btn-outline">Shop all</NuxtLink>
      </div>
    </div>

    <div v-else class="mt-10 grid gap-12 lg:grid-cols-[1fr,400px]">
      <ul class="divide-y divide-ink/10 border-y border-ink/10">
        <li v-for="item in items" :key="item.slug" class="flex gap-5 py-6">
          <NuxtLink :to="`/products/${item.slug}`" class="shrink-0">
            <NuxtImg :src="item.image" :alt="item.imageAlt" width="240" height="300" fit="crop" class="h-32 w-[6.4rem] bg-stone object-cover sm:h-40 sm:w-32" />
          </NuxtLink>
          <div class="flex flex-1 flex-col">
            <div class="flex justify-between gap-4">
              <NuxtLink :to="`/products/${item.slug}`" class="font-display text-xl hover:text-gold">{{ item.name }}</NuxtLink>
              <p class="text-sm">{{ formatKes(item.priceKes * item.qty) }}</p>
            </div>
            <p class="mt-1 text-sm text-ink-soft">{{ formatKes(item.priceKes) }} each</p>
            <div class="mt-auto flex items-center gap-6 pt-4">
              <div class="flex items-center border border-ink/25 text-sm">
                <button class="px-3.5 py-2" :aria-label="`Decrease quantity of ${item.name}`" @click="setQty(item.slug, item.qty - 1)">−</button>
                <span class="w-8 text-center tabular-nums" aria-live="polite">{{ item.qty }}</span>
                <button class="px-3.5 py-2 disabled:opacity-30" :aria-label="`Increase quantity of ${item.name}`" :disabled="item.qty >= item.stock" @click="setQty(item.slug, item.qty + 1)">+</button>
              </div>
              <button class="label text-ink-soft underline underline-offset-4 hover:text-ink" @click="remove(item.slug)">Remove</button>
            </div>
          </div>
        </li>
      </ul>

      <aside class="h-fit bg-stone p-8 lg:sticky lg:top-[136px]" aria-label="Order summary">
        <h2 class="font-display text-2xl">Order summary</h2>
        <dl class="mt-6 space-y-3 text-sm">
          <div class="flex justify-between"><dt>Subtotal ({{ count }} {{ count === 1 ? 'piece' : 'pieces' }})</dt><dd class="tabular-nums">{{ formatKes(subtotal) }}</dd></div>
          <div class="flex justify-between"><dt>Delivery in Nairobi</dt><dd>{{ delivery === 0 ? 'Free' : formatKes(delivery) }}</dd></div>
          <div class="flex justify-between border-t border-ink/15 pt-4 text-base"><dt>Total</dt><dd class="tabular-nums">{{ formatKes(total) }}</dd></div>
        </dl>
        <p v-if="toFree > 0" class="mt-4 text-xs text-ink-soft">Add {{ formatKes(toFree) }} more for free delivery in Nairobi.</p>
        <NuxtLink to="/checkout" class="btn-primary mt-8 w-full">Continue to checkout</NuxtLink>
        <p class="mt-4 text-center text-xs text-ink-soft">Pay with M-Pesa or card. Returns within 14 days.</p>
      </aside>
    </div>
  </div>
</template>
