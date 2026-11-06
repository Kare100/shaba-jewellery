<script setup lang="ts">
import type { Product } from '~~/shared/types'

const props = defineProps<{
  product: Product
  /** First row of a grid is visible straight away, so load it eagerly; the rest lazy-load. */
  eager?: boolean
}>()

// The tile tips toward the pointer like a piece turned under a lamp, with a glare that follows.
// Only reacts to a real mouse or pen, and not at all with reduced motion.
const tile = ref<HTMLElement>()
function onMove(e: PointerEvent) {
  if (e.pointerType === 'touch' || !tile.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = tile.value.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  tile.value.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
  tile.value.style.setProperty('--ry', `${(x - 0.5) * 12}deg`)
  tile.value.style.setProperty('--gx', `${x * 100}%`)
  tile.value.style.setProperty('--gy', `${y * 100}%`)
}
function onLeave() {
  tile.value?.style.setProperty('--rx', '0deg')
  tile.value?.style.setProperty('--ry', '0deg')
}
</script>

<template>
  <article class="group [perspective:900px]">
    <NuxtLink :to="`/products/${props.product.slug}`" class="block">
      <div
        ref="tile"
        class="tilt relative aspect-[4/5] overflow-hidden rounded-[3px] bg-velvet-soft shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
        @pointermove="onMove"
        @pointerleave="onLeave"
      >
        <NuxtImg
          :src="props.product.image"
          :alt="props.product.imageAlt"
          width="600"
          height="750"
          fit="cover"
          sizes="50vw md:33vw lg:320px"
          :loading="props.eager ? 'eager' : 'lazy'"
          class="h-full w-full scale-[1.02] object-cover transition-transform duration-700 ease-cinematic group-hover:scale-[1.08]"
        />
        <span class="glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
      </div>
      <div class="mt-4 flex items-baseline justify-between gap-3">
        <h3 class="font-display text-2xl leading-tight text-mist transition group-hover:text-champagne">{{ props.product.name }}</h3>
        <p class="shrink-0 text-sm text-champagne">{{ formatKes(props.product.priceKes) }}</p>
      </div>
      <p class="mt-1 text-sm text-mist/50">{{ props.product.material }}</p>
    </NuxtLink>
  </article>
</template>

<style scoped>
.tilt {
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.glare {
  background: radial-gradient(circle at var(--gx, 50%) var(--gy, 30%), rgb(240 226 198 / 0.22), transparent 55%);
  mix-blend-mode: screen;
}
</style>
