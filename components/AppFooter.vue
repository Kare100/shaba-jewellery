<script setup lang="ts">
import { CATEGORIES, CATEGORY_INFO } from '~~/shared/types'
</script>

<template>
  <footer class="relative mt-32 overflow-hidden border-t border-mist/10 bg-velvet-deep">
    <div class="container-page grid gap-10 py-16 text-sm text-mist/65 sm:grid-cols-[2fr,1fr,1fr]">
      <div>
        <p class="font-display text-4xl text-champagne">Shaba</p>
        <p class="mt-3 max-w-xs leading-relaxed">Jewellery set, polished and finished by hand in Westlands, Nairobi. Shaba is a fictional shop made for a take-home project.</p>
      </div>
      <nav aria-label="Footer">
        <p class="text-mist">Shop</p>
        <ul class="mt-3 space-y-2">
          <li v-for="c in CATEGORIES" :key="c">
            <NuxtLink :to="`/shop/${c}`" class="transition hover:text-champagne">{{ CATEGORY_INFO[c].label }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <div>
        <p class="text-mist">Studio</p>
        <p class="mt-3 leading-relaxed">Westlands, Nairobi<br />Monday to Saturday, 9am to 6pm</p>
      </div>
    </div>
    <p aria-hidden="true" class="pointer-events-none select-none text-center font-display text-display-xl leading-none text-mist/[0.04]">Shaba</p>
  </footer>
</template>
