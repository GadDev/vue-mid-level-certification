import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import CounterPanel from '../src/components/CounterPanel.vue'

function render() {
  return mount(CounterPanel, { global: { plugins: [createPinia()] } })
}

type Wrapper = ReturnType<typeof render>

function text(wrapper: Wrapper, testid: string): string {
  return wrapper.get(`[data-testid="${testid}"]`).text()
}

async function click(wrapper: Wrapper, testid: string) {
  await wrapper.get(`[data-testid="${testid}"]`).trigger('click')
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CounterPanel', () => {
  it('starts at zero', () => {
    const wrapper = render()
    expect(text(wrapper, 'count')).toBe('0')
    expect(text(wrapper, 'double')).toBe('0')
  })

  it('re-renders the state and the getter after an action', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    expect(text(wrapper, 'count')).toBe('1')
    expect(text(wrapper, 'double')).toBe('2')

    await click(wrapper, 'increment')
    expect(text(wrapper, 'count')).toBe('2')
    expect(text(wrapper, 'double')).toBe('4')
  })

  it('resets', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    await click(wrapper, 'reset')
    expect(text(wrapper, 'count')).toBe('0')
  })

  it('gives each pinia instance its own counter', async () => {
    const first = render()
    await click(first, 'increment')
    await click(first, 'increment')

    const second = render()
    expect(text(second, 'count')).toBe('0')
    expect(text(first, 'count')).toBe('2')
  })
})
