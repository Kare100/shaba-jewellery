<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: notFound.value ? 'Page not found' : 'Something went wrong',
  robots: 'noindex',
})
</script>

<template>
  <NuxtLayout>
    <div class="container-page pb-24 pt-44 text-center">
      <p class="text-sm text-gold">{{ props.error.statusCode }}</p>
      <h1 class="mt-3 text-display-md">{{ notFound ? 'We couldn’t find that page' : 'Something went wrong' }}</h1>
      <p class="mt-4 text-ink-soft">
        {{ notFound ? 'The piece may have sold out or moved.' : 'Please try again in a moment.' }}
      </p>
      <button class="btn-primary mt-8" @click="clearError({ redirect: '/shop' })">Back to the shop</button>
    </div>
  </NuxtLayout>
</template>
