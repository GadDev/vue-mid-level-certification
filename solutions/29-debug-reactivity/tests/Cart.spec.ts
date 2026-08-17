import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Cart from '../src/components/Cart.vue'
import { initialLines } from '../src/data/cart'

function render() {
  return mount(Cart)
}

type Wrapper = ReturnType<typeof render>

function names(wrapper: Wrapper, testid: string): string[] {
  return wrapper.findAll(`[data-testid="${testid}"]`).map(node => node.text())
}

function total(wrapper: Wrapper): string {
  return wrapper.get('[data-testid="total"]').text()
}

async function click(wrapper: Wrapper, testid: string) {
  await wrapper.get(`[data-testid="${testid}"]`).trigger('click')
}

describe('Cart', () => {
  it('starts with the initial lines and their total', () => {
    const wrapper = render()
    expect(names(wrapper, 'line')).toEqual(['Anvil', 'Bucket', 'Chisel'])
    expect(total(wrapper)).toBe('162')
  })

  it('updates the total when a line is added', async () => {
    const wrapper = render()
    await click(wrapper, 'add')
    expect(names(wrapper, 'line')).toHaveLength(4)
    expect(total(wrapper)).toBe('372')
  })

  it('updates the total when a line is removed', async () => {
    const wrapper = render()
    await click(wrapper, 'remove')
    expect(total(wrapper)).toBe('42')
  })

  it('sorts the cheap list without reordering the cart', () => {
    const wrapper = render()
    expect(names(wrapper, 'cheap')).toEqual(['Bucket', 'Chisel', 'Anvil'])
    expect(names(wrapper, 'line')).toEqual(['Anvil', 'Bucket', 'Chisel'])
  })

  it('keeps the cart order after an addition', async () => {
    const wrapper = render()
    await click(wrapper, 'add')
    expect(names(wrapper, 'line')).toEqual(['Anvil', 'Bucket', 'Chisel', 'Drill'])
    expect(names(wrapper, 'cheap')).toEqual(['Bucket', 'Chisel', 'Anvil', 'Drill'])
  })

  it('leaves the shared source data untouched', () => {
    render()
    expect(initialLines.map(line => line.name)).toEqual(['Anvil', 'Bucket', 'Chisel'])
  })
})
