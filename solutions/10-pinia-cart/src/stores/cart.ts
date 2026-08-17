import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Product {
  id: number
  name: string
  price: number
}

export interface CartLine extends Product {
  qty: number
}

const DISCOUNTS: Record<string, number> = { VUE10: 0.1, VUE20: 0.2 }

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])
  const discountCode = ref<string | null>(null)
  const discountError = ref('')

  // Getters are just computeds in a setup store — cached, and shared by every
  // component that uses the store.
  const itemCount = computed(() => lines.value.reduce((sum, line) => sum + line.qty, 0))
  const isEmpty = computed(() => lines.value.length === 0)
  const subtotal = computed(() =>
    round(lines.value.reduce((sum, line) => sum + line.price * line.qty, 0))
  )
  const discount = computed(() => {
    const rate = discountCode.value ? DISCOUNTS[discountCode.value] : undefined
    return rate ? round(subtotal.value * rate) : 0
  })
  const total = computed(() => round(subtotal.value - discount.value))

  function add(product: Product, qty = 1): void {
    if (qty <= 0) return
    const existing = lines.value.find(line => line.id === product.id)
    // Same product twice must merge into one line, not append a duplicate.
    if (existing) existing.qty += qty
    else lines.value.push({ ...product, qty })
  }

  function setQty(id: number, qty: number): void {
    const line = lines.value.find(candidate => candidate.id === id)
    if (!line) return
    if (qty <= 0) remove(id)
    else line.qty = Math.floor(qty)
  }

  function remove(id: number): void {
    lines.value = lines.value.filter(line => line.id !== id)
  }

  function applyDiscount(code: string): boolean {
    const normalised = code.trim().toUpperCase()
    if (!normalised) {
      discountCode.value = null
      discountError.value = ''
      return true
    }
    if (!(normalised in DISCOUNTS)) {
      discountCode.value = null
      discountError.value = `Unknown code “${code.trim()}”.`
      return false
    }
    discountCode.value = normalised
    discountError.value = ''
    return true
  }

  function clear(): void {
    lines.value = []
    discountCode.value = null
    discountError.value = ''
  }

  return {
    lines,
    discountCode,
    discountError,
    itemCount,
    isEmpty,
    subtotal,
    discount,
    total,
    add,
    setQty,
    remove,
    applyDiscount,
    clear,
  }
})
