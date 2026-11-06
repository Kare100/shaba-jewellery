<script setup lang="ts">
// Checkout is mocked, as the brief allows: no payment is taken and nothing is stored.
const { items, count, subtotal, clear, hydrated } = useCart()

const FREE_DELIVERY_FROM = 5000
const DELIVERY_FEE = 300
const delivery = computed(() => (subtotal.value >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE))
const total = computed(() => subtotal.value + delivery.value)

const form = reactive({ name: '', phone: '', area: '', payment: 'mpesa' })
const placing = ref(false)
const orderNumber = ref<string | null>(null)
const firstName = ref('')
const phoneValid = computed(() => /^(\+?254|0)(7|1)\d{8}$/.test(form.phone.replace(/\s/g, '')))

async function placeOrder() {
  if (!phoneValid.value) return
  placing.value = true
  await new Promise((r) => setTimeout(r, 900)) // stands in for a payment API call
  orderNumber.value = `SHB-${Date.now().toString().slice(-6)}`
  firstName.value = form.name.split(' ')[0] ?? ''
  clear()
  placing.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

usePageSeo({
  title: 'Checkout',
  description: 'Complete your Shaba Jewellery order.',
  path: '/checkout',
  noindex: true,
})
</script>

<template>
  <div class="container-page pb-10 pt-36 sm:pt-44">
    <div v-if="orderNumber" class="mx-auto max-w-xl bg-stone px-8 py-16 text-center" role="status">
      <p class="label text-gold">Order confirmed</p>
      <h1 class="mt-4 text-display-sm">Thank you, {{ firstName }}</h1>
      <p class="mt-4 text-ink-soft">
        Your order <span class="text-ink">{{ orderNumber }}</span> is confirmed. This is a demo store, so no payment was taken
        and nothing will be delivered.
      </p>
      <NuxtLink to="/shop" class="btn-primary mt-10">Keep shopping</NuxtLink>
    </div>

    <template v-else>
      <h1 class="text-display-md">Checkout</h1>
      <p class="mt-3 text-sm text-ink-soft">Demo checkout: no payment is taken and nothing is saved.</p>

      <p v-if="hydrated && count === 0" class="mt-10">
        Your bag is empty. <NuxtLink to="/shop" class="underline underline-offset-4">Browse the collection</NuxtLink>
      </p>

      <div v-else class="mt-10 grid gap-12 lg:grid-cols-[1fr,420px]">
        <form class="space-y-6" @submit.prevent="placeOrder">
          <fieldset class="space-y-5">
            <legend class="label mb-4">Contact and delivery</legend>
            <div>
              <label for="name" class="text-sm">Full name</label>
              <input id="name" v-model.trim="form.name" required autocomplete="name" class="input mt-2" />
            </div>
            <div>
              <label for="phone" class="text-sm">Phone number (for M-Pesa and delivery)</label>
              <input id="phone" v-model="form.phone" required type="tel" autocomplete="tel" placeholder="0712 345 678" class="input mt-2" :aria-invalid="form.phone !== '' && !phoneValid" aria-describedby="phone-help" />
              <p v-if="form.phone && !phoneValid" id="phone-help" class="mt-2 text-xs text-red-700">Enter a Kenyan mobile number, for example 0712 345 678.</p>
            </div>
            <div>
              <label for="area" class="text-sm">Delivery area</label>
              <input id="area" v-model.trim="form.area" required autocomplete="address-level2" placeholder="For example, Westlands, Nairobi" class="input mt-2" />
            </div>
          </fieldset>

          <fieldset>
            <legend class="label mb-4">Payment</legend>
            <div class="grid gap-3 sm:grid-cols-2">
              <label
                v-for="opt in [{ v: 'mpesa', t: 'M-Pesa', d: 'You get a payment prompt on your phone' }, { v: 'card', t: 'Card', d: 'Visa or Mastercard' }]"
                :key="opt.v"
                class="flex cursor-pointer items-start gap-3 border p-4 transition"
                :class="form.payment === opt.v ? 'border-ink bg-white' : 'border-ink/20 hover:border-ink/50'"
              >
                <input v-model="form.payment" type="radio" :value="opt.v" class="mt-1 accent-ink" />
                <span><span class="block text-sm">{{ opt.t }}</span><span class="block text-xs text-ink-soft">{{ opt.d }}</span></span>
              </label>
            </div>
          </fieldset>

          <button type="submit" class="btn-primary w-full" :disabled="placing || !items.length">
            {{ placing ? 'Placing order…' : `Place order, ${formatKes(total)}` }}
          </button>
        </form>

        <aside class="h-fit bg-stone p-8 lg:sticky lg:top-[136px]" aria-label="Order summary">
          <h2 class="font-display text-2xl">Your order</h2>
          <ul class="mt-6 space-y-4">
            <li v-for="item in items" :key="item.slug" class="flex gap-4">
              <NuxtImg :src="item.image" :alt="item.imageAlt" width="128" height="160" fit="crop" class="h-20 w-16 bg-paper object-cover" />
              <div class="flex flex-1 justify-between gap-3 text-sm">
                <span><span class="block">{{ item.name }}</span><span class="text-ink-soft">Qty {{ item.qty }}</span></span>
                <span class="tabular-nums">{{ formatKes(item.priceKes * item.qty) }}</span>
              </div>
            </li>
          </ul>
          <dl class="mt-6 space-y-3 border-t border-ink/15 pt-6 text-sm">
            <div class="flex justify-between"><dt>Subtotal</dt><dd class="tabular-nums">{{ formatKes(subtotal) }}</dd></div>
            <div class="flex justify-between"><dt>Delivery</dt><dd>{{ delivery === 0 ? 'Free' : formatKes(delivery) }}</dd></div>
            <div class="flex justify-between border-t border-ink/15 pt-4 text-base"><dt>Total</dt><dd class="tabular-nums">{{ formatKes(total) }}</dd></div>
          </dl>
        </aside>
      </div>
    </template>
  </div>
</template>
