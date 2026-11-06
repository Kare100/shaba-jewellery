<script setup lang="ts">
import type { Product } from '~~/shared/types'

const props = defineProps<{
  product: Product
  /** First row of a grid is visible straight away, so load it eagerly; the rest lazy-load. */
  eager?: boolean
}>()

const cart = useCart()
const added = ref(false)
function quickAdd() {
  cart.add(props.product, 1)
  added.value = true
  setTimeout(() => (added.value = false), 1800)
}
</script>

<template>
  <article class="group relative">
    <div class="relative aspect-[4/5] overflow-hidden bg-stone">
      <NuxtLink :to="`/products/${props.product.slug}`" class="block h-full" :aria-label="props.product.name" tabindex="-1">
        <NuxtImg
          :src="props.product.image"
          :alt="props.product.imageAlt"
          width="640"
          height="800"
          fit="crop"
          sizes="50vw md:33vw xl:440px"
          :loading="props.eager ? 'eager' : 'lazy'"
          class="h-full w-full object-cover transition-transform duration-[1400ms] ease-cinematic group-hover:scale-[1.06]"
        />
      </NuxtLink>
      <button
        v-if="props.product.stock > 0"
        type="button"
        class="label absolute inset-x-3 bottom-3 translate-y-2 bg-paper/95 py-3 text-center opacity-0 backdrop-blur transition duration-500 ease-cinematic hover:bg-ink hover:text-paper focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
        :aria-label="`Add ${props.product.name} to bag`"
        @click="quickAdd"
      >
        {{ added ? 'Added to bag' : 'Quick add' }}
      </button>
    </div>
    <NuxtLink :to="`/products/${props.product.slug}`" class="mt-4 block">
      <h3 class="font-display text-lg leading-snug sm:text-xl">{{ props.product.name }}</h3>
      <p class="mt-1 text-sm text-ink-soft">{{ props.product.material }}</p>
      <p class="mt-2 text-sm">{{ formatKes(props.product.priceKes) }}</p>
    </NuxtLink>
  </article>
</template>
