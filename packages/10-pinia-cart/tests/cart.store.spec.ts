import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { type Product, useCartStore } from '../src/stores/cart'

const phone: Product = { id: 1, name: 'Phone', price: 700 }
const tv: Product = { id: 2, name: 'TV', price: 1200 }

// A fresh pinia per test: stores are singletons per pinia instance, so without
// this every test would inherit the previous cart.
beforeEach(() => {
  setActivePinia(createPinia())
})

describe('cart store', () => {
  it('starts empty', () => {
    const cart = useCartStore()
    expect(cart.lines).toEqual([])
    expect(cart.itemCount).toBe(0)
    expect(cart.isEmpty).toBe(true)
    expect(cart.subtotal).toBe(0)
    expect(cart.total).toBe(0)
  })

  it('adds a product as a line', () => {
    const cart = useCartStore()
    cart.add(phone)

    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0]).toMatchObject({ id: 1, name: 'Phone', price: 700, qty: 1 })
    expect(cart.isEmpty).toBe(false)
  })

  it('merges the same product into one line', () => {
    const cart = useCartStore()
    cart.add(phone)
    cart.add(phone, 2)

    expect(cart.lines).toHaveLength(1)
    expect(cart.lines[0].qty).toBe(3)
    expect(cart.itemCount).toBe(3)
  })

  it('ignores a non-positive quantity', () => {
    const cart = useCartStore()
    cart.add(phone, 0)
    cart.add(tv, -2)
    expect(cart.lines).toHaveLength(0)
  })

  it('computes subtotal and item count across lines', () => {
    const cart = useCartStore()
    cart.add(phone, 2)
    cart.add(tv)

    expect(cart.itemCount).toBe(3)
    expect(cart.subtotal).toBe(2600)
    expect(cart.total).toBe(2600)
  })

  it('updates a line quantity', () => {
    const cart = useCartStore()
    cart.add(phone)
    cart.setQty(1, 4)
    expect(cart.itemCount).toBe(4)
    expect(cart.subtotal).toBe(2800)
  })

  it('removes the line when the quantity drops to zero or below', () => {
    const cart = useCartStore()
    cart.add(phone)
    cart.add(tv)

    cart.setQty(1, 0)
    expect(cart.lines.map(line => line.id)).toEqual([2])

    cart.setQty(2, -5)
    expect(cart.isEmpty).toBe(true)
  })

  it('ignores setQty for an unknown line', () => {
    const cart = useCartStore()
    cart.add(phone)
    cart.setQty(99, 3)
    expect(cart.itemCount).toBe(1)
  })

  it('removes a line by id', () => {
    const cart = useCartStore()
    cart.add(phone)
    cart.add(tv)
    cart.remove(1)
    expect(cart.lines.map(line => line.name)).toEqual(['TV'])
  })

  it('applies a known discount code', () => {
    const cart = useCartStore()
    cart.add(tv) // 1200
    expect(cart.applyDiscount('VUE10')).toBe(true)

    expect(cart.discountCode).toBe('VUE10')
    expect(cart.discount).toBe(120)
    expect(cart.total).toBe(1080)
    expect(cart.discountError).toBe('')
  })

  it('normalises the code (trim + case-insensitive)', () => {
    const cart = useCartStore()
    cart.add(tv)
    cart.applyDiscount('  vue20  ')

    expect(cart.discountCode).toBe('VUE20')
    expect(cart.total).toBe(960)
  })

  it('rejects an unknown code without touching the total', () => {
    const cart = useCartStore()
    cart.add(tv)
    expect(cart.applyDiscount('NOPE')).toBe(false)

    expect(cart.discountCode).toBeNull()
    expect(cart.discount).toBe(0)
    expect(cart.total).toBe(1200)
    expect(cart.discountError).not.toBe('')
  })

  it('clears the discount when an empty code is applied', () => {
    const cart = useCartStore()
    cart.add(tv)
    cart.applyDiscount('VUE10')
    cart.applyDiscount('   ')

    expect(cart.discountCode).toBeNull()
    expect(cart.total).toBe(1200)
    expect(cart.discountError).toBe('')
  })

  it('recomputes the discount when the cart changes', () => {
    const cart = useCartStore()
    cart.add(tv)
    cart.applyDiscount('VUE10')
    expect(cart.total).toBe(1080)

    cart.add(phone) // subtotal 1900
    expect(cart.discount).toBe(190)
    expect(cart.total).toBe(1710)
  })

  it('rounds money to two decimals', () => {
    const cart = useCartStore()
    cart.add({ id: 9, name: 'Cable', price: 9.99 }, 3) // 29.97
    cart.applyDiscount('VUE10') // 2.997 → 3.00

    expect(cart.subtotal).toBe(29.97)
    expect(cart.discount).toBe(3)
    expect(cart.total).toBe(26.97)
  })

  it('clears everything', () => {
    const cart = useCartStore()
    cart.add(phone)
    cart.applyDiscount('VUE10')
    cart.clear()

    expect(cart.isEmpty).toBe(true)
    expect(cart.discountCode).toBeNull()
    expect(cart.total).toBe(0)
  })

  it('gives every component the same store instance', () => {
    const a = useCartStore()
    const b = useCartStore()
    a.add(phone)
    expect(b.itemCount).toBe(1)
  })
})
