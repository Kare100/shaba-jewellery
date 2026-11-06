<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO, type Category, type Product } from '~~/shared/types'
import { HERO_JEWEL } from '~~/shared/jewels'

const { siteUrl, siteName } = useRuntimeConfig().public
const { data: featured } = await useFetch<Product[]>('/api/products', {
  query: { featured: 1 },
  key: 'featured-products',
})

const CATEGORY_IMAGE: Record<Category, string> = {
  rings: 'amani-solitaire-ring',
  necklaces: 'maasai-bead-collar',
  earrings: 'nyota-drop-earrings',
  bracelets: 'kito-tennis-bracelet',
}

usePageSeo({
  title: 'Handmade Jewellery in Nairobi',
  description:
    'Shop rings, necklaces, earrings and bracelets made and finished in Nairobi. Sterling silver, gold vermeil, copper and Maasai beadwork from Ksh 1,800.',
  path: '/',
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
    <!-- Hero: a live 3D ring turning under a spotlight, in front of the shop's name. -->
    <section class="relative h-[100svh] min-h-[640px] overflow-hidden" aria-labelledby="hero-heading">
      <div class="bg-spotlight reveal-light absolute inset-0" aria-hidden="true" />
      <p
        aria-hidden="true"
        class="reveal-word pointer-events-none absolute inset-x-0 top-[22%] select-none text-center font-display text-display-xl text-transparent"
        style="background: linear-gradient(180deg, #f0e2c6 0%, #9e8c6e 70%, rgba(158,140,110,0.1) 100%); -webkit-background-clip: text; background-clip: text;"
      >
        Shaba
      </p>
      <div class="absolute inset-0">
        <JewelCanvas :spec="HERO_JEWEL" scroll-linked :framing="1.05" label="A gold ring set with a green tsavorite, turning slowly" />
      </div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-velvet-deep to-transparent" aria-hidden="true" />

      <div class="container-page reveal-copy absolute inset-x-0 bottom-0 flex flex-col gap-8 pb-10 sm:pb-14 md:flex-row md:items-end md:justify-between">
        <div class="max-w-xl">
          <h1 id="hero-heading" class="text-display-sm text-mist">Jewellery made by hand in Nairobi</h1>
          <p class="mt-4 max-w-md leading-relaxed text-mist/70">
            Sterling silver, gold vermeil, hammered copper and Maasai beadwork, set and polished at our bench in Westlands.
          </p>
          <div class="mt-7 flex flex-wrap gap-3">
            <NuxtLink to="/shop" class="btn-primary">Shop the collection</NuxtLink>
            <NuxtLink to="/shop/rings" class="btn-ghost">See the rings</NuxtLink>
          </div>
        </div>
        <p class="hidden max-w-[16rem] text-right text-xs leading-relaxed text-mist/45 md:block">
          Shown: solitaire in gold vermeil with a tsavorite, the green garnet first found in Tsavo.
        </p>
      </div>
    </section>

    <!-- Categories: four tall panels, like display cases. -->
    <section class="container-page pt-24" aria-labelledby="cat-heading">
      <h2 id="cat-heading" class="text-display-md text-mist">Find your piece</h2>
      <ul class="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <li v-for="c in CATEGORIES" :key="c">
          <NuxtLink :to="`/shop/${c}`" class="group relative block aspect-[3/4] overflow-hidden rounded-[3px]">
            <NuxtImg
              :src="`/images/products/${CATEGORY_IMAGE[c]}.webp`"
              alt=""
              width="480"
              height="640"
              fit="cover"
              sizes="50vw md:25vw lg:300px"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-[1200ms] ease-cinematic group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-velvet-deep via-velvet-deep/10 to-transparent" />
            <div class="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <span class="block font-display text-3xl text-mist transition group-hover:text-champagne sm:text-4xl">{{ CATEGORY_INFO[c].label }}</span>
              <span class="mt-2 hidden text-sm leading-snug text-mist/60 sm:block">{{ CATEGORY_INFO[c].blurb }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="container-page pt-28" aria-labelledby="featured-heading">
      <div class="flex items-end justify-between gap-4">
        <h2 id="featured-heading" class="text-display-md text-mist">Most loved</h2>
        <NuxtLink to="/shop" class="pb-3 text-sm text-champagne underline-offset-8 hover:underline">See everything</NuxtLink>
      </div>
      <div class="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-5">
        <ProductCard v-for="p in featured ?? []" :key="p.id" :product="p" />
      </div>
    </section>

    <section class="container-page pt-32" aria-labelledby="studio-heading">
      <div class="grid gap-12 border-t border-mist/10 pt-16 md:grid-cols-[3fr,2fr]">
        <h2 id="studio-heading" class="max-w-3xl text-display-sm leading-tight text-mist">
          Every piece is set, polished and checked at our bench before it leaves the studio.
        </h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-8 self-end text-sm">
          <div>
            <dt class="text-mist/50">Silver</dt>
            <dd class="mt-1 text-mist">925 sterling, rhodium plated</dd>
          </div>
          <div>
            <dt class="text-mist/50">Gold</dt>
            <dd class="mt-1 text-mist">18k vermeil and plate</dd>
          </div>
          <div>
            <dt class="text-mist/50">Beadwork</dt>
            <dd class="mt-1 text-mist">Strung by hand in Kajiado</dd>
          </div>
          <div>
            <dt class="text-mist/50">Delivery</dt>
            <dd class="mt-1 text-mist">Free in Nairobi over Ksh 5,000</dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>
