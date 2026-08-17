import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Counter from '../src/components/Counter.vue'

function render() {
  return mount(Counter)
}

type Wrapper = ReturnType<typeof render>

function count(wrapper: Wrapper): string {
  return wrapper.get('[data-testid="count"]').text()
}

async function click(wrapper: Wrapper, testid: string) {
  await wrapper.get(`[data-testid="${testid}"]`).trigger('click')
}

describe('Counter', () => {
  it('starts at zero', () => {
    expect(count(render())).toBe('0')
  })

  it('increments the rendered count', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    expect(count(wrapper)).toBe('1')

    await click(wrapper, 'increment')
    expect(count(wrapper)).toBe('2')
  })

  it('resets back to zero', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    await click(wrapper, 'increment')
    await click(wrapper, 'reset')
    expect(count(wrapper)).toBe('0')
  })

  it('uses the step for the label and the increment', async () => {
    const wrapper = render()
    expect(wrapper.get('[data-testid="increment"]').text()).toBe('+1')
    await click(wrapper, 'increment')
    expect(count(wrapper)).toBe('1')
  })
})
