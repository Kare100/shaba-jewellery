<script setup lang="ts">
import type { Ref } from 'vue'
import { CATEGORY_INFO, type Product } from '~~/shared/types'
import { JEWELS } from '~~/shared/jewels'

const route = useRoute()
const slug = route.params.slug as string

const { data: product, error } = await useFetch<Product>(`/api/products/${slug}`, { key: `product-${slug}` })
if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found', fatal: true })
}
const p = product as Ref<Product>
const jewel = JEWELS[slug]

// "You may also like": others from the same category, fetched after the main content.
const { data: related } = useLazyFetch<Product[]>('/api/products', {
  query: { category: p.value.category },
  key: `related-${slug}`,
  transform: (list) => list.filter((x) => x.slug !== slug).slice(0, 4),
  server: false,
})

// The photo is in the server HTML (for search engines and a fast first paint);
// the 3D model fades in over it once WebGL is ready, and the photo stays if it isn't.
const show3d = ref(true)
const view3dReady = ref(false)

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
// Price tags for social and shopping crawlers that read Open Graph product data.
useHead({
  meta: [
    { property: 'product:price:amount', content: computed(() => String(p.value.priceKes)) },
    { property: 'product:price:currency', content: 'KES' },
  ],
})
useProductJsonLd(p)
</script>

<template>
  <div>
    <div class="grid lg:min-h-[100svh] lg:grid-cols-[1.15fr,1fr]">
      <!-- Stage: the piece under a spotlight. Drag to turn it. -->
      <div class="bg-spotlight relative aspect-square overflow-hidden lg:sticky lg:top-0 lg:aspect-auto lg:h-[100svh]">
        <NuxtImg
          :src="p.image"
          :alt="p.imageAlt"
          width="900"
          height="900"
          sizes="100vw lg:55vw"
          preload
          fetchpriority="high"
          class="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-cinematic"
          :class="view3dReady ? 'opacity-0' : 'opacity-100'"
        />
        <div v-if="jewel && show3d" class="absolute inset-0">
          <JewelCanvas
            :spec="jewel"
            interactive
            :framing="0.95"
            :label="`3D view of the ${p.name}. Drag to turn it.`"
            @ready="view3dReady = true"
            @failed="show3d = false"
          />
        </div>
        <p
          v-if="view3dReady"
          class="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-mist/50"
        >
          Drag to turn
        </p>
      </div>

      <div class="container-page flex flex-col justify-center py-14 lg:max-w-xl lg:px-14 lg:pt-32">
        <nav aria-label="Breadcrumb" class="text-sm text-mist/50">
          <ol class="flex flex-wrap gap-2">
            <li><NuxtLink to="/" class="hover:text-champagne">Home</NuxtLink> /</li>
            <li><NuxtLink to="/shop" class="hover:text-champagne">Shop</NuxtLink> /</li>
            <li>
              <NuxtLink :to="`/shop/${p.category}`" class="hover:text-champagne">{{ CATEGORY_INFO[p.category].label }}</NuxtLink>
            </li>
          </ol>
        </nav>

        <h1 class="mt-6 text-display-sm text-mist">{{ p.name }}</h1>
        <p class="mt-4 text-2xl text-champagne">{{ formatKes(p.priceKes) }}</p>
        <p class="mt-8 leading-relaxed text-mist/75">{{ p.description }}</p>

        <dl class="mt-8 grid grid-cols-[auto,1fr] gap-x-8 gap-y-3 border-y border-mist/10 py-6 text-sm">
          <dt class="text-mist/45">Material</dt>
          <dd class="text-mist">{{ p.material }}</dd>
          <dt class="text-mist/45">Reference</dt>
          <dd class="text-mist">{{ p.sku }}</dd>
          <dt class="text-mist/45">Availability</dt>
          <dd :class="inStock ? 'text-tsavorite' : 'text-red-400'">
            {{ inStock ? (p.stock <= 5 ? `Only ${p.stock} left` : 'In stock, ready to ship') : 'Sold out' }}
          </dd>
        </dl>

        <form class="mt-8 flex flex-wrap items-center gap-3" @submit.prevent="addToCart">
          <label class="sr-only" for="qty">Quantity</label>
          <div class="flex items-center rounded-full border border-mist/20">
            <button type="button" class="px-4 py-3 text-mist/70 hover:text-champagne disabled:opacity-30" aria-label="Decrease quantity" :disabled="qty <= 1" @click="qty--">−</button>
            <input id="qty" v-model.number="qty" type="number" min="1" :max="p.stock" class="w-10 bg-transparent text-center text-mist [appearance:textfield] focus:outline-none" />
            <button type="button" class="px-4 py-3 text-mist/70 hover:text-champagne disabled:opacity-30" aria-label="Increase quantity" :disabled="qty >= p.stock" @click="qty++">+</button>
          </div>
          <button type="submit" class="btn-primary flex-1" :disabled="!inStock">
            {{ inStock ? 'Add to cart' : 'Sold out' }}
          </button>
        </form>
        <p v-if="added" role="status" class="mt-4 text-sm text-tsavorite">
          Added to your cart. <NuxtLink to="/cart" class="text-champagne underline underline-offset-4">View cart</NuxtLink>
        </p>

        <ul class="mt-10 space-y-3 text-sm text-mist/55">
          <li>Free delivery in Nairobi on orders over Ksh 5,000</li>
          <li>Pay with M-Pesa or card</li>
          <li>Returns within 14 days on unworn pieces</li>
        </ul>
      </div>
    </div>

    <section v-if="related?.length" class="container-page pt-24" aria-labelledby="related-heading">
      <h2 id="related-heading" class="text-display-sm text-mist">More {{ CATEGORY_INFO[p.category].label.toLowerCase() }}</h2>
      <div class="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
        <ProductCard v-for="r in related" :key="r.id" :product="r" />
      </div>
    </section>
  </div>
</template>
