import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ProductTable from '../src/components/ProductTable.vue'
import { products, resetProducts } from '../src/data/products'

function render() {
  return mount(ProductTable)
}

type Wrapper = ReturnType<typeof render>

function column(wrapper: Wrapper, testid: 'name' | 'price' | 'rating'): string[] {
  return wrapper.findAll(`[data-testid="${testid}"]`).map(cell => cell.text())
}

async function sortBy(wrapper: Wrapper, key: 'name' | 'price' | 'rating') {
  await wrapper.get('[data-testid="sort-by"]').setValue(key)
}

async function toggle(wrapper: Wrapper) {
  await wrapper.get('[data-testid="toggle"]').trigger('click')
}

beforeEach(() => {
  resetProducts()
})

describe('ProductTable', () => {
  it('renders one row per product', () => {
    expect(render().findAll('[data-testid="row"]')).toHaveLength(5)
  })

  it('sorts by name ascending by default', () => {
    expect(column(render(), 'name')).toEqual(['Headphones', 'Keyboard', 'Mouse', 'Phone', 'TV'])
  })

  it('sorts by name descending after toggling', async () => {
    const wrapper = render()
    await toggle(wrapper)
    expect(column(wrapper, 'name')).toEqual(['TV', 'Phone', 'Mouse', 'Keyboard', 'Headphones'])
  })

  it('sorts price numerically, not lexicographically', async () => {
    const wrapper = render()
    await sortBy(wrapper, 'price')
    expect(column(wrapper, 'price')).toEqual(['120', '250', '250', '700', '1200'])

    await toggle(wrapper)
    expect(column(wrapper, 'price')).toEqual(['1200', '700', '250', '250', '120'])
  })

  it('sorts by rating in both directions', async () => {
    const wrapper = render()
    await sortBy(wrapper, 'rating')
    expect(column(wrapper, 'rating')).toEqual(['4.2', '4.2', '4.5', '4.7', '4.8'])

    await toggle(wrapper)
    expect(column(wrapper, 'rating')).toEqual(['4.8', '4.7', '4.5', '4.2', '4.2'])
  })

  it('keeps equal values in a deterministic order', async () => {
    const wrapper = render()
    await sortBy(wrapper, 'rating')
    // Keyboard (id 3) before Mouse (id 5): ties fall back to id, not to chance.
    expect(column(wrapper, 'name').slice(0, 2)).toEqual(['Keyboard', 'Mouse'])
  })

  it('reflects the current direction on the toggle button', async () => {
    const wrapper = render()
    expect(wrapper.get('[data-testid="toggle"]').attributes('data-direction')).toBe('asc')

    await toggle(wrapper)
    expect(wrapper.get('[data-testid="toggle"]').attributes('data-direction')).toBe('desc')

    await toggle(wrapper)
    expect(wrapper.get('[data-testid="toggle"]').attributes('data-direction')).toBe('asc')
  })

  it('never mutates the source array', async () => {
    const before = products.value.map(product => product.id)
    const wrapper = render()

    await sortBy(wrapper, 'price')
    await toggle(wrapper)
    await sortBy(wrapper, 'name')

    expect(products.value.map(product => product.id)).toEqual(before)
  })

  it('stays in sync when the source data changes', async () => {
    const wrapper = render()
    await sortBy(wrapper, 'price')

    products.value.push({ id: 6, name: 'Webcam', price: 90, rating: 4.0 })
    await wrapper.vm.$nextTick()

    expect(column(wrapper, 'name')[0]).toBe('Webcam')
    expect(wrapper.findAll('[data-testid="row"]')).toHaveLength(6)
  })
})
