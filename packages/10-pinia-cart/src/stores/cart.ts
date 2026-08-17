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

// VUE10 = 10% off, VUE20 = 20% off. Anything else is an unknown code.
const DISCOUNTS: Record<string, number> = { VUE10: 0.1, VUE20: 0.2 }

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])
  const discountCode = ref<string | null>(null)
  const discountError = ref('')

  // TODO: itemCount, isEmpty, subtotal, discount, total as computed getters
  // (all money values rounded to 2 decimals)
  const itemCount = computed(() => 0)
  const isEmpty = computed(() => true)
  const subtotal = computed(() => 0)
  const discount = computed(() => 0)
  const total = computed(() => 0)

  // TODO: add (merge same product into one line), setQty (0 or less removes the
  // line), remove, applyDiscount (trimmed, case-insensitive, sets discountError
  // for an unknown code and returns whether it applied), clear
  function add(_product: Product, _qty = 1): void {}
  function setQty(_id: number, _qty: number): void {}
  function remove(_id: number): void {}
  function applyDiscount(_code: string): boolean {
    return false
  }
  function clear(): void {}

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
