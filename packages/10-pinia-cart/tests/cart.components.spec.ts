import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App.vue'

let pinia: ReturnType<typeof createPinia>

function render() {
  return mount(App, { global: { plugins: [pinia] } })
}

type Wrapper = ReturnType<typeof render>

function text(wrapper: Wrapper, testid: string): string {
  return wrapper.get(`[data-testid="${testid}"]`).text()
}

async function addProduct(wrapper: Wrapper, row: number) {
  await wrapper.findAll('[data-testid="product"]')[row].get('[data-testid="add"]').trigger('click')
}

beforeEach(() => {
  pinia = createPinia()
})

describe('cart components', () => {
  it('lists the products and starts with an empty cart', () => {
    const wrapper = render()
    expect(wrapper.findAll('[data-testid="product"]')).toHaveLength(4)
    expect(wrapper.findAll('[data-testid="line"]')).toHaveLength(0)
    expect(text(wrapper, 'count')).toBe('0')
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
  })

  it('adding in one component updates the other', async () => {
    const wrapper = render()
    await addProduct(wrapper, 1) // TV, 1200

    expect(text(wrapper, 'count')).toBe('1')
    expect(text(wrapper, 'line-name')).toBe('TV')
    expect(text(wrapper, 'subtotal')).toBe('1200.00')
    expect(text(wrapper, 'total')).toBe('1200.00')
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false)
  })

  it('keeps one line when the same product is added twice', async () => {
    const wrapper = render()
    await addProduct(wrapper, 0)
    await addProduct(wrapper, 0)

    expect(wrapper.findAll('[data-testid="line"]')).toHaveLength(1)
    expect(text(wrapper, 'count')).toBe('2')
    expect(text(wrapper, 'subtotal')).toBe('1400.00')
  })

  it('edits a quantity from the summary', async () => {
    const wrapper = render()
    await addProduct(wrapper, 2) // Keyboard, 120
    await wrapper.get('[data-testid="qty"]').setValue('3')

    expect(text(wrapper, 'count')).toBe('3')
    expect(text(wrapper, 'subtotal')).toBe('360.00')
  })

  it('removes a line when its quantity is set to zero', async () => {
    const wrapper = render()
    await addProduct(wrapper, 2)
    await wrapper.get('[data-testid="qty"]').setValue('0')

    expect(wrapper.findAll('[data-testid="line"]')).toHaveLength(0)
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
  })

  it('removes a line from its Remove button', async () => {
    const wrapper = render()
    await addProduct(wrapper, 0)
    await addProduct(wrapper, 1)
    await wrapper.findAll('[data-testid="remove"]')[0].trigger('click')

    expect(wrapper.findAll('[data-testid="line"]')).toHaveLength(1)
    expect(text(wrapper, 'line-name')).toBe('TV')
  })

  it('applies a discount code from the form', async () => {
    const wrapper = render()
    await addProduct(wrapper, 1) // 1200
    await wrapper.get('[data-testid="discount"]').setValue('vue10')
    await wrapper.get('[data-testid="discount-form"]').trigger('submit')

    expect(text(wrapper, 'discount-amount')).toBe('120.00')
    expect(text(wrapper, 'total')).toBe('1080.00')
    expect(wrapper.find('[data-testid="discount-error"]').exists()).toBe(false)
  })

  it('shows an error for an unknown code', async () => {
    const wrapper = render()
    await addProduct(wrapper, 1)
    await wrapper.get('[data-testid="discount"]').setValue('FREE')
    await wrapper.get('[data-testid="discount-form"]').trigger('submit')

    expect(wrapper.get('[data-testid="discount-error"]').text()).not.toBe('')
    expect(text(wrapper, 'total')).toBe('1200.00')
  })

  it('reprices the discount when the cart changes afterwards', async () => {
    const wrapper = render()
    await addProduct(wrapper, 1) // 1200
    await wrapper.get('[data-testid="discount"]').setValue('VUE10')
    await wrapper.get('[data-testid="discount-form"]').trigger('submit')
    await addProduct(wrapper, 0) // + 700 = 1900

    expect(text(wrapper, 'discount-amount')).toBe('190.00')
    expect(text(wrapper, 'total')).toBe('1710.00')
  })

  it('clears the cart', async () => {
    const wrapper = render()
    await addProduct(wrapper, 0)
    await addProduct(wrapper, 1)
    await wrapper.get('[data-testid="clear"]').trigger('click')

    expect(wrapper.findAll('[data-testid="line"]')).toHaveLength(0)
    expect(text(wrapper, 'count')).toBe('0')
    expect(text(wrapper, 'total')).toBe('0.00')
  })

  it('starts from a clean store in every test', () => {
    expect(text(render(), 'count')).toBe('0')
  })
})
