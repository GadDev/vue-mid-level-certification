import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Countdown from '../src/components/Countdown.vue'

function render() {
  return mount(Countdown)
}

type Wrapper = ReturnType<typeof render>

function time(wrapper: Wrapper): string {
  return wrapper.get('[data-testid="time"]').text()
}

function isDisabled(wrapper: Wrapper, testid: string): boolean {
  return wrapper.get<HTMLButtonElement>(`[data-testid="${testid}"]`).element.disabled
}

async function click(wrapper: Wrapper, testid: string) {
  await wrapper.get(`[data-testid="${testid}"]`).trigger('click')
}

async function tick(wrapper: Wrapper, ms: number) {
  vi.advanceTimersByTime(ms)
  await wrapper.vm.$nextTick()
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Countdown', () => {
  it('shows the formatted start time', () => {
    const wrapper = render()
    expect(time(wrapper)).toBe('01:30')
    expect(isDisabled(wrapper, 'start')).toBe(false)
    expect(isDisabled(wrapper, 'pause')).toBe(true)
  })

  it('counts down after Start', async () => {
    const wrapper = render()
    await click(wrapper, 'start')
    await tick(wrapper, 5000)
    expect(time(wrapper)).toBe('01:25')
    expect(isDisabled(wrapper, 'start')).toBe(true)
    expect(isDisabled(wrapper, 'pause')).toBe(false)
  })

  it('holds the time while paused', async () => {
    const wrapper = render()
    await click(wrapper, 'start')
    await tick(wrapper, 2000)
    await click(wrapper, 'pause')
    await tick(wrapper, 5000)
    expect(time(wrapper)).toBe('01:28')
  })

  it('goes back to the start on Reset', async () => {
    const wrapper = render()
    await click(wrapper, 'start')
    await tick(wrapper, 4000)
    await click(wrapper, 'reset')
    expect(time(wrapper)).toBe('01:30')
    expect(isDisabled(wrapper, 'start')).toBe(false)
  })

  it('announces the end and locks Start', async () => {
    const wrapper = render()
    expect(wrapper.find('[data-testid="done"]').exists()).toBe(false)

    await click(wrapper, 'start')
    await tick(wrapper, 90_000)
    expect(time(wrapper)).toBe('00:00')
    expect(wrapper.get('[data-testid="done"]').text()).toBe("Time's up!")
    expect(isDisabled(wrapper, 'start')).toBe(true)
  })
})
