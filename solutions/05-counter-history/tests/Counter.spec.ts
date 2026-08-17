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

function isDisabled(wrapper: Wrapper, testid: string): boolean {
  return wrapper.get<HTMLButtonElement>(`[data-testid="${testid}"]`).element.disabled
}

async function click(wrapper: Wrapper, testid: string) {
  await wrapper.get(`[data-testid="${testid}"]`).trigger('click')
}

describe('Counter', () => {
  it('starts at zero with undo and redo disabled', () => {
    const wrapper = render()
    expect(count(wrapper)).toBe('0')
    expect(isDisabled(wrapper, 'undo')).toBe(true)
    expect(isDisabled(wrapper, 'redo')).toBe(true)
  })

  it('increments and decrements from the buttons', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    await click(wrapper, 'increment')
    expect(count(wrapper)).toBe('2')

    await click(wrapper, 'decrement')
    expect(count(wrapper)).toBe('1')
  })

  it('enables undo after the first change', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    expect(isDisabled(wrapper, 'undo')).toBe(false)
    expect(isDisabled(wrapper, 'redo')).toBe(true)
  })

  it('undoes and redoes through the UI', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    await click(wrapper, 'increment')

    await click(wrapper, 'undo')
    expect(count(wrapper)).toBe('1')
    expect(isDisabled(wrapper, 'redo')).toBe(false)

    await click(wrapper, 'redo')
    expect(count(wrapper)).toBe('2')
    expect(isDisabled(wrapper, 'redo')).toBe(true)
  })

  it('undoes a reset', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    await click(wrapper, 'reset')
    expect(count(wrapper)).toBe('0')

    await click(wrapper, 'undo')
    expect(count(wrapper)).toBe('1')
  })

  it('disables redo again once a new change follows an undo', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    await click(wrapper, 'undo')
    expect(isDisabled(wrapper, 'redo')).toBe(false)

    await click(wrapper, 'decrement')
    expect(count(wrapper)).toBe('-1')
    expect(isDisabled(wrapper, 'redo')).toBe(true)
  })

  it('walks all the way back to the start and forward again', async () => {
    const wrapper = render()
    await click(wrapper, 'increment')
    await click(wrapper, 'increment')
    await click(wrapper, 'decrement')

    await click(wrapper, 'undo')
    await click(wrapper, 'undo')
    await click(wrapper, 'undo')
    expect(count(wrapper)).toBe('0')
    expect(isDisabled(wrapper, 'undo')).toBe(true)

    await click(wrapper, 'redo')
    await click(wrapper, 'redo')
    await click(wrapper, 'redo')
    expect(count(wrapper)).toBe('1')
    expect(isDisabled(wrapper, 'redo')).toBe(true)
  })
})
