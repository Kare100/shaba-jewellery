<script setup lang="ts">
import type { Product } from '~~/shared/types'

const { data: products } = await useFetch<Product[]>('/api/products', { key: 'all-products' })

usePageSeo({
  title: 'Shop All Jewellery',
  description:
    'Browse every ring, necklace, earring and bracelet in the Shaba collection. Silver, gold vermeil, copper and beadwork, with delivery across Kenya.',
  path: '/shop',
})
useItemListJsonLd(() => products.value ?? [])
</script>

<template>
  <ProductListing
    :products="products ?? []"
    heading="All jewellery"
    intro="Every piece in the collection, from everyday studs to statement beadwork."
  />
</template>
