<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO } from '~~/shared/types'
</script>

<template>
  <footer class="mt-28 bg-stone">
    <div class="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[2fr,1fr,1fr,1fr]">
      <div>
        <p class="font-display text-3xl tracking-[0.32em]">SHABA</p>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
          Fine jewellery in 18k gold vermeil, set and finished by hand at our studio in Westlands, Nairobi.
        </p>
      </div>
      <nav aria-label="Shop">
        <p class="label">Shop</p>
        <ul class="mt-4 space-y-2.5 text-sm text-ink-soft">
          <li v-for="c in CATEGORIES" :key="c"><NuxtLink :to="`/shop/${c}`" class="hover:text-ink">{{ CATEGORY_INFO[c].label }}</NuxtLink></li>
          <li><NuxtLink to="/shop" class="hover:text-ink">Shop all</NuxtLink></li>
        </ul>
      </nav>
      <div>
        <p class="label">Help</p>
        <ul class="mt-4 space-y-2.5 text-sm text-ink-soft">
          <li>Delivery across Kenya</li>
          <li>Returns within 14 days</li>
          <li>Free engraving</li>
          <li>Jewellery care</li>
        </ul>
      </div>
      <div>
        <p class="label">Studio</p>
        <p class="mt-4 text-sm leading-relaxed text-ink-soft">Westlands, Nairobi<br />Monday to Saturday<br />9am to 6pm</p>
      </div>
    </div>
    <div class="container-page flex flex-col gap-2 border-t border-ink/10 py-6 text-xs text-ink-soft sm:flex-row sm:justify-between">
      <p>© {{ new Date().getFullYear() }} Shaba Jewellery. A demo store built for a take-home project; Shaba is not a real shop.</p>
      <p>Photography from <a href="https://unsplash.com" class="underline underline-offset-2 hover:text-ink" rel="noopener" target="_blank">Unsplash</a></p>
    </div>
  </footer>
</template>
