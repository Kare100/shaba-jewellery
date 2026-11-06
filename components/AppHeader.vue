<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO } from '~~/shared/types'

const { count, hydrated } = useCart()
const route = useRoute()
const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))

// On the home page the header floats over the hero photo in white, and turns solid once you scroll.
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 40)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
// Sits on the stone hero/header colour until you scroll, then becomes a solid bar.
const overHero = computed(() => (route.path === '/' || route.path.startsWith('/shop')) && !scrolled.value && !menuOpen.value)

const notes = [
  'Free delivery in Nairobi on orders over Ksh 5,000',
  'Free engraving on every ID bracelet and signet',
  'Pay with M-Pesa or card',
  'Returns within 14 days',
]
</script>

<template>
  <div class="fixed inset-x-0 top-0 z-50">
    <!-- Announcement bar: the store's promises, on a slow loop. -->
    <div class="overflow-hidden bg-ink py-2 text-paper" aria-label="Store information">
      <div class="marquee flex w-max gap-16 whitespace-nowrap text-[11px] tracking-[0.12em]">
        <span v-for="(n, i) in [...notes, ...notes]" :key="i" :aria-hidden="i >= notes.length">{{ n }}</span>
      </div>
    </div>

    <header
      class="transition-colors duration-500 ease-cinematic"
      :class="overHero ? 'border-b border-transparent bg-stone text-ink' : 'border-b border-ink/10 bg-paper/95 text-ink backdrop-blur-md'"
    >
      <div class="container-page grid h-16 grid-cols-[1fr,auto,1fr] items-center sm:h-[72px]">
        <nav aria-label="Main" class="hidden items-center gap-7 lg:flex">
          <NuxtLink v-for="c in CATEGORIES" :key="c" :to="`/shop/${c}`" class="label opacity-90 transition hover:opacity-100 hover:text-gold" active-class="text-gold">
            {{ CATEGORY_INFO[c].label }}
          </NuxtLink>
          <NuxtLink to="/shop" class="label opacity-90 transition hover:text-gold" exact-active-class="text-gold">Shop all</NuxtLink>
        </nav>
        <button
          class="-ml-2 p-2 lg:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
            <path v-if="!menuOpen" d="M3 8h18M3 16h18" />
            <path v-else d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <NuxtLink to="/" class="font-display text-[26px] tracking-[0.32em] sm:text-[30px]" aria-label="Shaba Jewellery, home">SHABA</NuxtLink>

        <div class="flex justify-end">
          <NuxtLink to="/cart" class="label flex items-center gap-2 py-2 transition hover:text-gold">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">
              <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span class="hidden sm:inline">Bag</span>
            <span class="tabular-nums">({{ hydrated ? count : 0 }})</span>
            <span class="sr-only">items in your bag</span>
          </NuxtLink>
        </div>
      </div>

      <nav v-show="menuOpen" id="mobile-nav" aria-label="Mobile" class="border-t border-ink/10 bg-paper text-ink lg:hidden">
        <div class="container-page flex flex-col py-4">
          <NuxtLink v-for="c in CATEGORIES" :key="c" :to="`/shop/${c}`" class="border-b border-ink/10 py-4 font-display text-2xl">
            {{ CATEGORY_INFO[c].label }}
          </NuxtLink>
          <NuxtLink to="/shop" class="py-4 font-display text-2xl">Shop all</NuxtLink>
        </div>
      </nav>
    </header>
  </div>
</template>
