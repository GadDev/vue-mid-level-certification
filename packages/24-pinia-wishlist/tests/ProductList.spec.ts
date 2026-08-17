import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import ProductList from '../src/components/ProductList.vue'
import { STORAGE_KEY, useWishlistStore } from '../src/stores/wishlist'

function render() {
  return mount(ProductList, { global: { plugins: [createPinia()] } })
}

beforeEach(() => {
  window.localStorage.clear()
  setActivePinia(createPinia())
})

describe('ProductList', () => {
  it('starts with an empty wishlist', () => {
    const wrapper = render()
    expect(wrapper.get('[data-testid="count"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="fav-1"]').attributes('aria-pressed')).toBe('false')
  })

  it('toggles a favourite from the button', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="fav-2"]').trigger('click')

    expect(wrapper.get('[data-testid="count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="fav-2"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="fav-1"]').attributes('aria-pressed')).toBe('false')
  })

  it('toggles it back off', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="fav-2"]').trigger('click')
    await wrapper.get('[data-testid="fav-2"]').trigger('click')
    expect(wrapper.get('[data-testid="count"]').text()).toBe('0')
  })

  it('clears everything', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="fav-1"]').trigger('click')
    await wrapper.get('[data-testid="fav-3"]').trigger('click')
    expect(wrapper.get('[data-testid="count"]').text()).toBe('2')

    await wrapper.get('[data-testid="clear"]').trigger('click')
    expect(wrapper.get('[data-testid="count"]').text()).toBe('0')
    expect(wrapper.get('[data-testid="fav-1"]').attributes('aria-pressed')).toBe('false')
  })

  it('shows what was persisted before it mounted', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([4]))
    const wrapper = render()
    expect(wrapper.get('[data-testid="count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="fav-4"]').attributes('aria-pressed')).toBe('true')
    expect(useWishlistStore().isFavorite(4)).toBe(true)
  })
})
