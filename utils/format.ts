const kes = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })

/** 4800 -> "Ksh 4,800" */
export function formatKes(amount: number) {
  return kes.format(amount)
}
