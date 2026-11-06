<script setup lang="ts">
// Checkout is mocked, as the brief allows: no payment is taken and nothing is stored.
const { items, count, subtotal, clear, hydrated } = useCart()

const form = reactive({ name: '', phone: '', area: '', payment: 'mpesa' })
const placing = ref(false)
const orderNumber = ref<string | null>(null)
const phoneValid = computed(() => /^(\+?254|0)(7|1)\d{8}$/.test(form.phone.replace(/\s/g, '')))

async function placeOrder() {
  if (!phoneValid.value) return
  placing.value = true
  await new Promise((r) => setTimeout(r, 800)) // pretend to call a payment API
  orderNumber.value = `SHB-${Date.now().toString().slice(-6)}`
  clear()
  placing.value = false
}

usePageSeo({
  title: 'Checkout',
  description: 'Complete your Shaba Jewellery order.',
  path: '/checkout',
  noindex: true,
})
</script>

<template>
  <div class="container-page max-w-2xl pb-10 pt-32 sm:pt-36">
    <div v-if="orderNumber" class="rounded-[3px] bg-velvet-soft p-10 text-center" role="status">
      <h1 class="text-display-sm text-mist">Thank you, {{ form.name.split(' ')[0] }}!</h1>
      <p class="mt-3">Order <strong>{{ orderNumber }}</strong> is confirmed. This is a demo, so no payment was taken.</p>
      <NuxtLink to="/shop" class="btn-primary mt-6">Keep shopping</NuxtLink>
    </div>

    <template v-else>
      <h1 class="text-display-sm text-mist">Checkout</h1>
      <p class="mt-2 text-sm text-mist/50">Demo checkout: no payment is taken and nothing is saved.</p>

      <p v-if="hydrated && count === 0" class="mt-8">
        Your cart is empty. <NuxtLink to="/shop" class="underline">Browse the collection</NuxtLink>
      </p>

      <form v-else class="mt-8 space-y-5" @submit.prevent="placeOrder">
        <div>
          <label for="name" class="text-sm font-medium">Full name</label>
          <input id="name" v-model.trim="form.name" required autocomplete="name" class="input mt-1" />
        </div>
        <div>
          <label for="phone" class="text-sm font-medium">Phone (for M-Pesa and delivery)</label>
          <input id="phone" v-model="form.phone" required type="tel" autocomplete="tel" placeholder="0712 345 678" class="input mt-1" :aria-invalid="form.phone !== '' && !phoneValid" />
          <p v-if="form.phone && !phoneValid" class="mt-1 text-xs text-red-400">Enter a Kenyan mobile number, e.g. 0712 345 678.</p>
        </div>
        <div>
          <label for="area" class="text-sm font-medium">Delivery area</label>
          <input id="area" v-model.trim="form.area" required placeholder="e.g. Westlands, Nairobi" class="input mt-1" />
        </div>
        <fieldset>
          <legend class="text-sm font-medium">Payment</legend>
          <div class="mt-2 flex gap-4 text-sm">
            <label class="flex items-center gap-2"><input v-model="form.payment" type="radio" value="mpesa" /> M-Pesa</label>
            <label class="flex items-center gap-2"><input v-model="form.payment" type="radio" value="card" /> Card</label>
          </div>
        </fieldset>
        <div class="flex items-center justify-between rounded-[3px] bg-velvet-soft p-5">
          <span>{{ count }} items</span>
          <span class="text-lg font-semibold">{{ formatKes(subtotal) }}</span>
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="placing || !items.length">
          {{ placing ? 'Placing order…' : 'Place order' }}
        </button>
      </form>
    </template>
  </div>
</template>
