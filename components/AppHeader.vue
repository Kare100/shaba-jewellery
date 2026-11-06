<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO } from '~~/shared/types'

const { count, hydrated } = useCart()
const menuOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (menuOpen.value = false))

// Fully transparent over the hero; picks up a glass background once you scroll.
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 24)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-cinematic"
    :class="scrolled || menuOpen ? 'border-b border-mist/10 bg-velvet-deep/75 backdrop-blur-xl' : 'border-b border-transparent'"
  >
    <div class="container-page flex h-16 items-center justify-between gap-6 sm:h-20">
      <NuxtLink to="/" class="font-display text-3xl text-champagne" aria-label="Shaba Jewellery, home">Shaba</NuxtLink>

      <nav aria-label="Main" class="hidden items-center gap-8 text-sm text-mist/75 md:flex">
        <NuxtLink to="/shop" class="transition hover:text-champagne" exact-active-class="text-champagne">Everything</NuxtLink>
        <NuxtLink
          v-for="c in CATEGORIES"
          :key="c"
          :to="`/shop/${c}`"
          class="transition hover:text-champagne"
          active-class="text-champagne"
        >
          {{ CATEGORY_INFO[c].label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-1">
        <NuxtLink to="/cart" class="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm text-mist/80 transition hover:text-champagne" aria-label="Cart">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
          <span class="hidden sm:inline">Cart</span>
          <span
            v-if="hydrated && count > 0"
            class="grid h-5 min-w-5 place-items-center rounded-full bg-champagne px-1 text-[11px] font-semibold text-velvet-deep"
          >
            {{ count }}
          </span>
        </NuxtLink>
        <button
          class="rounded-full p-2 text-mist md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <path v-if="!menuOpen" d="M4 8h16M4 16h16" />
            <path v-else d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>

    <nav v-show="menuOpen" id="mobile-nav" aria-label="Mobile" class="md:hidden">
      <div class="container-page flex flex-col pb-6 pt-2">
        <NuxtLink to="/shop" class="py-3 font-display text-3xl">Everything</NuxtLink>
        <NuxtLink v-for="c in CATEGORIES" :key="c" :to="`/shop/${c}`" class="py-3 font-display text-3xl">
          {{ CATEGORY_INFO[c].label }}
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
