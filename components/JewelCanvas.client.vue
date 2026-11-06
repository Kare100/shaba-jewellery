<script setup lang="ts">
// Client-only (.client.vue): WebGL does not exist on the server.
import type { JewelSpec } from '~~/shared/jewels'
import type { JewelHandle } from '~/lib/jewel-scene'

const props = defineProps<{
  spec: JewelSpec
  interactive?: boolean
  /** Turn and lift the piece as the page scrolls (hero). */
  scrollLinked?: boolean
  framing?: number
  label: string
}>()
const emit = defineEmits<{ ready: []; failed: [] }>()

const canvas = ref<HTMLCanvasElement>()
const ready = ref(false)
let handle: JewelHandle | undefined
const cleanups: (() => void)[] = []

onMounted(async () => {
  if (!canvas.value) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  try {
    // Three.js arrives in its own chunk, only on pages that show a 3D piece.
    const { mountJewel } = await import('~/lib/jewel-scene')
    handle = mountJewel(canvas.value, props.spec, {
      interactive: props.interactive,
      reducedMotion,
      framing: props.framing,
      onReady: () => {
        ready.value = true
        emit('ready')
      },
    })
  } catch (err) {
    console.warn('3D view unavailable, showing the photo instead.', err)
    emit('failed')
    return
  }

  if (!props.interactive && !reducedMotion) {
    const onPointer = (e: PointerEvent) =>
      handle?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    window.addEventListener('pointermove', onPointer, { passive: true })
    cleanups.push(() => window.removeEventListener('pointermove', onPointer))
  }
  if (props.scrollLinked && !reducedMotion) {
    const onScroll = () => handle?.setScroll(window.scrollY / window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    cleanups.push(() => window.removeEventListener('scroll', onScroll))
  }
})

onBeforeUnmount(() => {
  cleanups.forEach((fn) => fn())
  handle?.dispose()
})
</script>

<template>
  <canvas
    ref="canvas"
    role="img"
    :aria-label="props.label"
    class="block h-full w-full transition-opacity duration-[1600ms] ease-cinematic"
    :class="[ready ? 'opacity-100' : 'opacity-0', props.interactive ? 'cursor-grab touch-pan-y active:cursor-grabbing' : 'pointer-events-none']"
  />
</template>
