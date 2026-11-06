<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO, type Category, type Product } from '~~/shared/types'

// Shared by /shop and /shop/[category] so both pages look and behave the same.
const props = defineProps<{
  products: Product[]
  heading: string
  intro: string
  active?: Category
}>()

const sort = ref<'featured' | 'price-asc' | 'price-desc'>('featured')
const sorted = computed(() => {
  const list = [...props.products]
  if (sort.value === 'price-asc') list.sort((a, b) => a.priceKes - b.priceKes)
  if (sort.value === 'price-desc') list.sort((a, b) => b.priceKes - a.priceKes)
  return list
})
</script>

<template>
  <div>
    <header class="bg-spotlight relative overflow-hidden pb-14 pt-32 sm:pt-40">
      <div class="container-page relative">
        <nav aria-label="Breadcrumb" class="text-sm text-mist/50">
          <ol class="flex gap-2">
            <li><NuxtLink to="/" class="hover:text-champagne">Home</NuxtLink> /</li>
            <li v-if="props.active"><NuxtLink to="/shop" class="hover:text-champagne">Shop</NuxtLink> /</li>
            <li aria-current="page" class="text-mist/80">{{ props.active ? CATEGORY_INFO[props.active].label : 'Shop' }}</li>
          </ol>
        </nav>
        <h1 class="mt-6 text-display-md text-mist">{{ props.heading }}</h1>
        <p class="mt-4 max-w-xl leading-relaxed text-mist/65">{{ props.intro }}</p>
      </div>
    </header>

    <div class="container-page">
      <div class="sticky top-16 z-30 -mx-4 flex flex-wrap items-center justify-between gap-4 border-b border-mist/10 bg-velvet-deep/85 px-4 py-4 backdrop-blur-xl sm:top-20 sm:-mx-8 sm:px-8">
        <ul class="flex gap-2 overflow-x-auto text-sm">
          <li>
            <NuxtLink
              to="/shop"
              class="block whitespace-nowrap rounded-full border px-4 py-1.5 transition"
              :class="!props.active ? 'border-champagne bg-champagne text-velvet-deep' : 'border-mist/20 text-mist/75 hover:border-champagne hover:text-champagne'"
            >Everything</NuxtLink>
          </li>
          <li v-for="c in CATEGORIES" :key="c">
            <NuxtLink
              :to="`/shop/${c}`"
              class="block whitespace-nowrap rounded-full border px-4 py-1.5 transition"
              :class="props.active === c ? 'border-champagne bg-champagne text-velvet-deep' : 'border-mist/20 text-mist/75 hover:border-champagne hover:text-champagne'"
            >
              {{ CATEGORY_INFO[c].label }}
            </NuxtLink>
          </li>
        </ul>
        <label class="flex items-center gap-3 text-sm">
          <span class="text-mist/50">Sort by</span>
          <select v-model="sort" class="rounded-full border border-mist/20 bg-velvet-soft px-4 py-1.5 text-mist">
            <option value="featured">Most loved</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
        </label>
      </div>

      <p class="mt-6 text-sm text-mist/45">{{ sorted.length }} {{ sorted.length === 1 ? 'piece' : 'pieces' }}</p>
      <div class="mt-6 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
        <ProductCard v-for="(p, i) in sorted" :key="p.id" :product="p" :eager="i < 4" />
      </div>
    </div>
  </div>
</template>
