<script setup lang="ts">
import { CATEGORY_INFO, isCategory, type Category, type Product } from '~~/shared/types'

const route = useRoute()
const category = route.params.category as string

// Unknown category -> real 404 status (not a soft 404), so search engines don't index junk URLs.
if (!isCategory(category)) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found', fatal: true })
}

const active: Category = category
const info = CATEGORY_INFO[active]
const { data: products } = await useFetch<Product[]>('/api/products', {
  query: { category },
  key: `category-${category}`,
})

const prices = computed(() => (products.value ?? []).map((p) => p.priceKes))
const from = computed(() => (prices.value.length ? formatKes(Math.min(...prices.value)) : ''))

usePageSeo(() => ({
  title: `${info.label} – Handmade in Nairobi`,
  description: `Shop ${info.label.toLowerCase()} from Shaba Jewellery. ${info.blurb}${from.value ? ` From ${from.value}.` : ''}`,
  path: `/shop/${category}`,
  image: products.value?.[0]?.image,
  imageAlt: products.value?.[0]?.imageAlt,
}))
useItemListJsonLd(() => products.value ?? [])
</script>

<template>
  <ProductListing
    :products="products ?? []"
    :heading="info.label"
    :intro="info.blurb"
    :active="active"
  />
</template>
