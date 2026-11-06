<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO, type Product } from '~~/shared/types'
import { CATEGORY_PHOTOS, PHOTOS } from '~~/shared/photos'

const { siteUrl, siteName } = useRuntimeConfig().public
const { data: featured } = await useFetch<Product[]>('/api/products', {
  query: { featured: 1 },
  key: 'featured-products',
})

// Slow parallax on the hero photo: it drifts at a third of the scroll speed, like a camera dolly.
const heroShift = ref(0)
const onScroll = () => (heroShift.value = Math.min(window.scrollY, window.innerHeight) * 0.15)
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// The editorial image opens like a curtain the first time it scrolls into view.
const editorial = ref<HTMLElement>()
const editorialShown = ref(false)
onMounted(() => {
  if (!editorial.value) return
  const io = new IntersectionObserver(([e]) => {
    if (e?.isIntersecting) {
      editorialShown.value = true
      io.disconnect()
    }
  }, { threshold: 0.25 })
  io.observe(editorial.value)
})

usePageSeo({
  title: 'Fine Gold Jewellery, Handmade in Nairobi',
  description:
    'Rings, necklaces, earrings and bracelets in 18k gold vermeil, set and finished by hand in Nairobi. Free delivery in Nairobi over Ksh 5,000.',
  path: '/',
  image: PHOTOS.hero.src,
  imageAlt: PHOTOS.hero.alt,
})
useJsonLd({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: siteName, url: siteUrl, logo: `${siteUrl}/favicon.svg` },
    { '@type': 'WebSite', name: siteName, url: siteUrl },
  ],
})
</script>

<template>
  <div>
    <!-- Hero: an editorial split, copy on stone beside a full-height portrait photograph. -->
    <section class="grid bg-stone pt-[96px] sm:pt-[104px] lg:min-h-[100svh] lg:grid-cols-2" aria-labelledby="hero-heading">
      <div class="relative order-1 aspect-[4/5] overflow-hidden lg:order-2 lg:aspect-auto">
        <div class="absolute inset-0 will-change-transform" :style="{ transform: `translate3d(0, ${heroShift}px, 0)` }">
          <NuxtImg
            :src="PHOTOS.hero.src"
            :alt="PHOTOS.hero.alt"
            width="1100"
            height="1375"
            fit="crop"
            sizes="100vw lg:50vw"
            preload
            fetchpriority="high"
            class="hero-photo h-full w-full object-cover object-[50%_35%]"
          />
        </div>
      </div>
      <div class="hero-copy order-2 flex flex-col justify-end px-6 py-14 sm:px-12 lg:order-1 lg:px-16 lg:pb-24 xl:px-24">
        <p class="label text-gold">The Shaba Gold Edit</p>
        <h1 id="hero-heading" class="mt-5 max-w-xl text-display-lg">Fine gold jewellery, finished by hand in Nairobi</h1>
        <p class="mt-6 max-w-md leading-relaxed text-ink-soft">
          Rings, chains, hoops and pearls in 18k gold vermeil, made to be layered, stacked and worn every day.
        </p>
        <div class="mt-10 flex flex-wrap gap-3">
          <NuxtLink to="/shop" class="btn-primary">Shop the collection</NuxtLink>
          <NuxtLink to="/shop/rings" class="btn-outline">Discover rings</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Shop by category: four portrait photos, label underneath. -->
    <section class="container-page pt-20 sm:pt-28" aria-labelledby="cat-heading">
      <div class="flex items-end justify-between gap-6">
        <h2 id="cat-heading" class="text-display-sm">Shop by category</h2>
        <NuxtLink to="/shop" class="link-underline hidden sm:inline-block">Shop all</NuxtLink>
      </div>
      <ul class="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        <li v-for="c in CATEGORIES" :key="c">
          <NuxtLink :to="`/shop/${c}`" class="group block">
            <div class="aspect-[3/4] overflow-hidden bg-stone">
              <NuxtImg
                :src="CATEGORY_PHOTOS[c].src"
                :alt="CATEGORY_PHOTOS[c].alt"
                width="600"
                height="800"
                fit="crop"
                sizes="50vw lg:25vw xl:340px"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-[1400ms] ease-cinematic group-hover:scale-[1.06]"
              />
            </div>
            <span class="mt-4 flex items-center justify-between">
              <span class="font-display text-xl sm:text-2xl">{{ CATEGORY_INFO[c].label }}</span>
              <span class="label text-ink-soft transition group-hover:text-gold">Shop</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="container-page pt-24 sm:pt-32" aria-labelledby="featured-heading">
      <div class="text-center">
        <p class="label text-gold">Bestsellers</p>
        <h2 id="featured-heading" class="mt-3 text-display-md">Most loved</h2>
      </div>
      <div class="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3">
        <ProductCard v-for="p in featured ?? []" :key="p.id" :product="p" />
      </div>
      <div class="mt-14 text-center">
        <NuxtLink to="/shop" class="btn-outline">View all jewellery</NuxtLink>
      </div>
    </section>

    <!-- Editorial: a large photograph and the story of how the pieces are made. -->
    <section class="pt-24 sm:pt-32" aria-labelledby="studio-heading">
      <div class="grid items-center bg-stone lg:grid-cols-2">
        <div ref="editorial" class="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[760px]">
          <NuxtImg
            :src="PHOTOS.editorial.src"
            :alt="PHOTOS.editorial.alt"
            width="1100"
            height="1375"
            fit="crop"
            sizes="100vw lg:50vw"
            loading="lazy"
            class="h-full w-full object-cover transition-[clip-path,transform] duration-[1800ms] ease-cinematic motion-reduce:transition-none"
            :class="editorialShown ? '[clip-path:inset(0_0_0_0)] scale-100' : '[clip-path:inset(0_0_100%_0)] scale-110'"
          />
        </div>
        <div class="px-6 py-16 sm:px-14 lg:px-20 xl:px-28">
          <p class="label text-gold">Our studio</p>
          <h2 id="studio-heading" class="mt-4 text-display-md">Made to be worn every day</h2>
          <p class="mt-6 max-w-md leading-relaxed text-ink-soft">
            Every piece starts as sterling silver and is finished with a thick layer of 18k gold, so it keeps its warmth
            through showers, school runs and late dinners. Stones are set, polished and checked at our bench in Westlands
            before anything leaves the studio.
          </p>
          <dl class="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-6 border-t border-ink/15 pt-8 text-sm">
            <div><dt class="text-ink-soft">Gold layer</dt><dd class="mt-1">2.5 microns of 18k gold</dd></div>
            <div><dt class="text-ink-soft">Base metal</dt><dd class="mt-1">925 sterling silver</dd></div>
            <div><dt class="text-ink-soft">Stones</dt><dd class="mt-1">Topaz, tourmaline, sapphire</dd></div>
            <div><dt class="text-ink-soft">Pearls</dt><dd class="mt-1">Freshwater, knotted on silk</dd></div>
          </dl>
          <NuxtLink to="/shop" class="btn-primary mt-12">Explore the collection</NuxtLink>
        </div>
      </div>
    </section>

    <section class="container-page pt-20" aria-label="Our promises">
      <ul class="grid gap-10 text-center sm:grid-cols-3">
        <li>
          <p class="font-display text-xl">Free delivery in Nairobi</p>
          <p class="mt-2 text-sm text-ink-soft">On orders over Ksh 5,000, usually the next working day.</p>
        </li>
        <li>
          <p class="font-display text-xl">Engraved by hand</p>
          <p class="mt-2 text-sm text-ink-soft">Free on every ID bracelet and signet ring.</p>
        </li>
        <li>
          <p class="font-display text-xl">14-day returns</p>
          <p class="mt-2 text-sm text-ink-soft">Changed your mind? Send unworn pieces back for a full refund.</p>
        </li>
      </ul>
    </section>
  </div>
</template>
