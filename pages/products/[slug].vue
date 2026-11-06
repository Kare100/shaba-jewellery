<script setup lang="ts">
import type { Ref } from 'vue'
import { CATEGORY_INFO, type Product } from '~~/shared/types'
import { CATEGORY_PHOTOS } from '~~/shared/photos'

const route = useRoute()
const slug = route.params.slug as string

const { data: product, error } = await useFetch<Product>(`/api/products/${slug}`, { key: `product-${slug}` })
if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true })
}
const p = product as Ref<Product>

// Gallery: the product shot, then the piece's category worn, for scale.
const gallery = computed(() => [
  { src: p.value.image, alt: p.value.imageAlt },
  CATEGORY_PHOTOS[p.value.category],
])
const activeImage = ref(0)

// Hover to zoom: the photo scales up 2x and follows the pointer, like a loupe.
const zoom = reactive({ on: false, x: 50, y: 50 })
function onZoomMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  zoom.x = ((e.clientX - r.left) / r.width) * 100
  zoom.y = ((e.clientY - r.top) / r.height) * 100
  zoom.on = true
}

const { data: related } = useLazyFetch<Product[]>('/api/products', {
  query: { category: p.value.category },
  key: `related-${slug}`,
  transform: (list) => list.filter((x) => x.slug !== slug).slice(0, 3),
  server: false,
})

const cart = useCart()
const qty = ref(1)
const added = ref(false)
const inStock = computed(() => p.value.stock > 0)
function addToCart() {
  cart.add(p.value, qty.value)
  added.value = true
  setTimeout(() => (added.value = false), 3000)
}

usePageSeo(() => ({
  title: `${p.value.name} – ${formatKes(p.value.priceKes)}`,
  description: p.value.shortDescription,
  path: `/products/${p.value.slug}`,
  image: p.value.image,
  imageAlt: p.value.imageAlt,
}))
useHead({
  meta: [
    { property: 'product:price:amount', content: computed(() => String(p.value.priceKes)) },
    { property: 'product:price:currency', content: 'KES' },
  ],
})
useProductJsonLd(p)
</script>

<template>
  <div class="pt-[96px] sm:pt-[104px]">
    <div class="container-page pt-6">
      <nav aria-label="Breadcrumb" class="label text-ink-soft">
        <ol class="flex flex-wrap gap-2">
          <li><NuxtLink to="/" class="hover:text-ink">Home</NuxtLink> /</li>
          <li><NuxtLink to="/shop" class="hover:text-ink">Shop</NuxtLink> /</li>
          <li><NuxtLink :to="`/shop/${p.category}`" class="hover:text-ink">{{ CATEGORY_INFO[p.category].label }}</NuxtLink> /</li>
          <li aria-current="page" class="text-ink">{{ p.name }}</li>
        </ol>
      </nav>
    </div>

    <div class="container-page mt-6 grid gap-10 lg:grid-cols-[1.25fr,1fr] lg:gap-16">
      <!-- Gallery -->
      <div class="flex flex-col-reverse gap-3 sm:flex-row">
        <div class="flex gap-3 sm:flex-col" role="tablist" aria-label="Product photos">
          <button
            v-for="(img, i) in gallery"
            :key="img.src"
            type="button"
            role="tab"
            :aria-selected="activeImage === i"
            :aria-label="`Photo ${i + 1}`"
            class="h-20 w-16 overflow-hidden bg-stone transition sm:h-24 sm:w-20"
            :class="activeImage === i ? 'ring-1 ring-ink ring-offset-2 ring-offset-paper' : 'opacity-60 hover:opacity-100'"
            @click="activeImage = i"
          >
            <NuxtImg :src="img.src" alt="" width="160" height="200" fit="crop" class="h-full w-full object-cover" />
          </button>
        </div>
        <div
          class="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-stone"
          @pointermove="onZoomMove"
          @pointerleave="zoom.on = false"
        >
          <NuxtImg
            v-for="(img, i) in gallery"
            :key="img.src"
            :src="img.src"
            :alt="img.alt"
            width="1100"
            height="1375"
            fit="crop"
            sizes="100vw lg:55vw xl:760px"
            :preload="i === 0"
            :fetchpriority="i === 0 ? 'high' : 'auto'"
            :loading="i === 0 ? 'eager' : 'lazy'"
            class="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-cinematic"
            :class="activeImage === i ? 'opacity-100' : 'opacity-0'"
            :style="activeImage === i && zoom.on ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}"
          />
        </div>
      </div>

      <!-- Details -->
      <div class="lg:sticky lg:top-[136px] lg:self-start">
        <p class="label text-gold">{{ CATEGORY_INFO[p.category].label }}</p>
        <h1 class="mt-3 text-display-sm">{{ p.name }}</h1>
        <p class="mt-4 text-xl">{{ formatKes(p.priceKes) }}</p>
        <p class="mt-6 max-w-md leading-relaxed text-ink-soft">{{ p.shortDescription }}</p>

        <p class="mt-8 text-sm" :class="inStock ? 'text-ink' : 'text-red-700'">
          <span class="mr-2 inline-block h-2 w-2 rounded-full" :class="inStock ? 'bg-emerald-600' : 'bg-red-600'" aria-hidden="true" />
          {{ inStock ? (p.stock <= 5 ? `Only ${p.stock} left` : 'In stock, ships in 1–2 days') : 'Sold out' }}
        </p>

        <form class="mt-6 flex gap-3" @submit.prevent="addToCart">
          <label class="sr-only" for="qty">Quantity</label>
          <div class="flex items-center border border-ink/25">
            <button type="button" class="px-4 py-4 disabled:opacity-30" aria-label="Decrease quantity" :disabled="qty <= 1" @click="qty--">−</button>
            <input id="qty" v-model.number="qty" type="number" min="1" :max="p.stock" class="w-8 bg-transparent text-center text-sm [appearance:textfield] focus:outline-none" />
            <button type="button" class="px-4 py-4 disabled:opacity-30" aria-label="Increase quantity" :disabled="qty >= p.stock" @click="qty++">+</button>
          </div>
          <button type="submit" class="btn-primary flex-1" :disabled="!inStock">
            {{ !inStock ? 'Sold out' : added ? 'Added to bag' : 'Add to bag' }}
          </button>
        </form>
        <p v-if="added" role="status" class="mt-4 text-sm">
          Added to your bag. <NuxtLink to="/cart" class="underline underline-offset-4">View bag</NuxtLink>
        </p>

        <div class="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          <details class="group py-5" open>
            <summary class="label flex cursor-pointer list-none items-center justify-between">
              Details <span class="text-lg font-light transition group-open:rotate-45">+</span>
            </summary>
            <p class="mt-4 text-sm leading-relaxed text-ink-soft">{{ p.description }}</p>
            <dl class="mt-4 grid grid-cols-[auto,1fr] gap-x-6 gap-y-1.5 text-sm">
              <dt class="text-ink-soft">Material</dt><dd>{{ p.material }}</dd>
              <dt class="text-ink-soft">Reference</dt><dd>{{ p.sku }}</dd>
            </dl>
          </details>
          <details class="group py-5">
            <summary class="label flex cursor-pointer list-none items-center justify-between">
              Care <span class="text-lg font-light transition group-open:rotate-45">+</span>
            </summary>
            <p class="mt-4 text-sm leading-relaxed text-ink-soft">
              Take your jewellery off before swimming or the gym, keep it away from perfume, and wipe it with a soft cloth.
              Store each piece in its pouch so it doesn't scratch.
            </p>
          </details>
          <details class="group py-5">
            <summary class="label flex cursor-pointer list-none items-center justify-between">
              Delivery and returns <span class="text-lg font-light transition group-open:rotate-45">+</span>
            </summary>
            <p class="mt-4 text-sm leading-relaxed text-ink-soft">
              Free delivery in Nairobi on orders over Ksh 5,000, usually the next working day. Delivery across Kenya takes 2–4 days.
              Return unworn pieces within 14 days for a full refund.
            </p>
          </details>
        </div>
      </div>
    </div>

    <section v-if="related?.length" class="container-page pt-28" aria-labelledby="related-heading">
      <h2 id="related-heading" class="text-center text-display-sm">You may also like</h2>
      <div class="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3">
        <ProductCard v-for="r in related" :key="r.id" :product="r" />
      </div>
    </section>
  </div>
</template>
