<script setup lang="ts">
import type { Product } from '~~/shared/types'

const { data: products } = await useFetch<Product[]>('/api/products', { key: 'all-products' })

usePageSeo({
  title: 'Shop All Jewellery',
  description:
    'Browse every ring, necklace, earring and bracelet from Shaba: 18k gold vermeil, white topaz, pink tourmaline and freshwater pearls, finished by hand in Nairobi.',
  path: '/shop',
})
useItemListJsonLd(() => products.value ?? [])
</script>

<template>
  <ProductListing
    :products="products ?? []"
    heading="All jewellery"
    intro="Every piece in the collection, from everyday huggies to hand-knotted pearls."
  />
</template>
