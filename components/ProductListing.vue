<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO, type Category, type Product } from '~~/shared/types'
import { CATEGORY_PHOTOS, PHOTOS } from '~~/shared/photos'

// Shared by /shop and /shop/[category] so both pages look and behave the same.
const props = defineProps<{
  products: Product[]
  heading: string
  intro: string
  active?: Category
}>()

const banner = computed(() => (props.active ? CATEGORY_PHOTOS[props.active] : PHOTOS.editorial))

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
    <!-- Header: title and intro beside a portrait photo of the category being worn -->
    <header class="bg-stone pt-[96px] sm:pt-[104px]">
      <div class="container-page grid items-end gap-8 py-10 md:grid-cols-[1fr,minmax(0,360px)] md:py-14">
        <div class="hero-copy">
          <nav aria-label="Breadcrumb" class="label text-ink-soft">
            <ol class="flex gap-2">
              <li><NuxtLink to="/" class="hover:text-ink">Home</NuxtLink> /</li>
              <li v-if="props.active"><NuxtLink to="/shop" class="hover:text-ink">Shop</NuxtLink> /</li>
              <li aria-current="page" class="text-ink">{{ props.active ? CATEGORY_INFO[props.active].label : 'Shop all' }}</li>
            </ol>
          </nav>
          <h1 class="mt-5 text-display-lg">{{ props.heading }}</h1>
          <p class="mt-4 max-w-lg leading-relaxed text-ink-soft">{{ props.intro }}</p>
        </div>
        <div class="hidden aspect-[4/5] overflow-hidden md:block">
          <NuxtImg
            :src="banner.src"
            :alt="banner.alt"
            width="720"
            height="900"
            fit="crop"
            sizes="360px"
            preload
            class="hero-photo h-full w-full object-cover"
          />
        </div>
      </div>
    </header>

    <div class="container-page">
      <div class="sticky top-[96px] z-30 -mx-4 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 bg-paper/95 px-4 py-4 backdrop-blur-md sm:top-[104px] sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <ul class="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li>
            <NuxtLink to="/shop" class="label whitespace-nowrap pb-1" :class="!props.active ? 'border-b border-ink' : 'text-ink-soft hover:text-ink'">All</NuxtLink>
          </li>
          <li v-for="c in CATEGORIES" :key="c">
            <NuxtLink :to="`/shop/${c}`" class="label whitespace-nowrap pb-1" :class="props.active === c ? 'border-b border-ink' : 'text-ink-soft hover:text-ink'">
              {{ CATEGORY_INFO[c].label }}
            </NuxtLink>
          </li>
        </ul>
        <div class="flex items-center gap-6">
          <p class="label text-ink-soft">{{ sorted.length }} {{ sorted.length === 1 ? 'piece' : 'pieces' }}</p>
          <label class="flex items-center gap-2">
            <span class="sr-only">Sort by</span>
            <select v-model="sort" class="label cursor-pointer border-0 bg-transparent py-1 pr-6 focus:ring-0">
              <option value="featured">Bestsellers</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
            </select>
          </label>
        </div>
      </div>

      <p v-if="!sorted.length" class="py-24 text-center text-ink-soft">
        Nothing here yet. <NuxtLink to="/shop" class="underline">See all jewellery</NuxtLink>.
      </p>
      <div v-else class="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3">
        <ProductCard v-for="(p, i) in sorted" :key="p.id" :product="p" :eager="i < 3" />
      </div>
    </div>
  </div>
</template>
