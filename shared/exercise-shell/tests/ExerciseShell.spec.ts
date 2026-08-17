import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import ExerciseLayout from '../src/ExerciseLayout.vue'
import ExerciseTimer from '../src/ExerciseTimer.vue'

// The component autostarts by default; most cases below drive the clock by hand.
function render(props: { minutes: number; autostart?: boolean }) {
  return mount(ExerciseTimer, { props: { autostart: false, ...props } })
}

type Wrapper = ReturnType<typeof render>

function readout(wrapper: Wrapper): string {
  return wrapper.get('[data-testid="exercise-timer-remaining"]').text()
}

function toggle(wrapper: Wrapper) {
  return wrapper.get('[data-testid="exercise-timer-toggle"]').trigger('click')
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ExerciseTimer', () => {
  it('starts counting down on mount', async () => {
    const wrapper = mount(ExerciseTimer, { props: { minutes: 25 } })
    // The clock starts in `onMounted` (never during SSR), so the label lands next tick.
    await nextTick()
    expect(wrapper.get('[data-testid="exercise-timer-toggle"]').text()).toBe('Pause')

    await vi.advanceTimersByTimeAsync(10_000)
    expect(readout(wrapper)).toBe('24:50')
  })

  it('renders the full budget and stays put when autostart is off', async () => {
    const wrapper = render({ minutes: 25 })
    expect(readout(wrapper)).toBe('25:00')
    expect(wrapper.get('[data-testid="exercise-timer-toggle"]').text()).toBe('Start')

    await vi.advanceTimersByTimeAsync(10_000)
    expect(readout(wrapper)).toBe('25:00')
  })

  it('counts down once started', async () => {
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)
    await vi.advanceTimersByTimeAsync(15_000)
    expect(readout(wrapper)).toBe('00:45')
  })

  it('honours an explicit autostart', async () => {
    const wrapper = render({ minutes: 1, autostart: true })
    await vi.advanceTimersByTimeAsync(5_000)
    expect(readout(wrapper)).toBe('00:55')
  })

  it('pauses and resumes without losing the remaining time', async () => {
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)
    await vi.advanceTimersByTimeAsync(10_000)
    await toggle(wrapper)
    expect(wrapper.get('[data-testid="exercise-timer-toggle"]').text()).toBe('Start')

    await vi.advanceTimersByTimeAsync(30_000)
    expect(readout(wrapper)).toBe('00:50')

    await toggle(wrapper)
    await vi.advanceTimersByTimeAsync(5_000)
    expect(readout(wrapper)).toBe('00:45')
  })

  it('ignores a second start instead of stacking a second interval', async () => {
    const wrapper = render({ minutes: 1 })
    wrapper.vm.start()
    wrapper.vm.start()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(readout(wrapper)).toBe('00:50')
  })

  it('hands no time back across a pause/resume cycle', async () => {
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)
    // Pause on a fraction of a second: rounding the stored remainder up here is
    // what used to gift the user most of a second per pause.
    await vi.advanceTimersByTimeAsync(10_500)
    await toggle(wrapper)
    await toggle(wrapper)

    await vi.advanceTimersByTimeAsync(49_400)
    expect(wrapper.emitted('done')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(100)
    expect(wrapper.emitted('done')).toHaveLength(1)
  })

  it('only warns near the end of a short budget', async () => {
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)
    expect(wrapper.get('[data-testid="exercise-timer"]').classes()).not.toContain('is-warning')

    await vi.advanceTimersByTimeAsync(35_000)
    expect(wrapper.get('[data-testid="exercise-timer"]').classes()).toContain('is-warning')
  })

  it('renders no timer at all for a non-positive budget', () => {
    expect(render({ minutes: 0 }).find('[data-testid="exercise-timer"]').exists()).toBe(false)
    expect(render({ minutes: -5 }).find('[data-testid="exercise-timer"]').exists()).toBe(false)
  })

  it('does not announce a zero budget as expired', () => {
    const wrapper = render({ minutes: 0, autostart: true })
    expect(wrapper.find('[data-testid="exercise-timer-done"]').exists()).toBe(false)
    expect(wrapper.emitted('done')).toBeUndefined()
  })

  it('resets back to the full budget and stops', async () => {
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)
    await vi.advanceTimersByTimeAsync(20_000)
    await wrapper.get('[data-testid="exercise-timer-reset"]').trigger('click')

    expect(readout(wrapper)).toBe('01:00')
    await vi.advanceTimersByTimeAsync(10_000)
    expect(readout(wrapper)).toBe('01:00')
  })

  it('stops at zero and emits done exactly once', async () => {
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)
    await vi.advanceTimersByTimeAsync(90_000)

    expect(readout(wrapper)).toBe('00:00')
    expect(wrapper.emitted('done')).toHaveLength(1)
    expect(wrapper.find('[data-testid="exercise-timer-done"]').exists()).toBe(true)
  })

  it('restarts the clock when the budget changes', async () => {
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)
    await vi.advanceTimersByTimeAsync(20_000)

    await wrapper.setProps({ minutes: 2 })
    await nextTick()
    expect(readout(wrapper)).toBe('02:00')
    expect(wrapper.get('[data-testid="exercise-timer-toggle"]').text()).toBe('Start')
  })

  it('clears its interval when the owning scope is stopped', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const wrapper = render({ minutes: 1 })
    await toggle(wrapper)

    wrapper.unmount()
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })

  it('survives being run outside a component', () => {
    const scope = effectScope()
    // onScopeDispose (not onUnmounted) is what makes this legal at all.
    expect(() => scope.run(() => undefined)).not.toThrow()
    scope.stop()
  })
})

describe('ExerciseLayout', () => {
  it('renders the title, the timer and the exercise in a <main>', () => {
    const wrapper = mount(ExerciseLayout, {
      props: { title: '01-scroll-to-item', minutes: 25 },
      slots: { default: '<p data-testid="exercise-body">exercise</p>' },
    })

    expect(wrapper.get('[data-testid="exercise-title"]').text()).toBe('01-scroll-to-item')
    expect(wrapper.get('[data-testid="exercise-timer-remaining"]').text()).toBe('25:00')
    expect(wrapper.get('main [data-testid="exercise-body"]').text()).toBe('exercise')
  })

  it('renders nav slot content beside the title', () => {
    const wrapper = mount(ExerciseLayout, {
      props: { title: '09-router-master-detail', minutes: 35 },
      slots: { nav: '<a data-testid="extra-link">Users</a>' },
    })

    expect(wrapper.find('[data-testid="exercise-nav"] [data-testid="extra-link"]').exists()).toBe(
      true
    )
  })

  it('starts the countdown as soon as the page renders', async () => {
    const wrapper = mount(ExerciseLayout, { props: { title: 'x', minutes: 10 } })
    await vi.advanceTimersByTimeAsync(60_000)
    expect(wrapper.get('[data-testid="exercise-timer-remaining"]').text()).toBe('09:00')
  })

  it('forwards the timer expiry to the exercise', async () => {
    const wrapper = mount(ExerciseLayout, { props: { title: 'x', minutes: 1 } })
    await vi.advanceTimersByTimeAsync(61_000)
    expect(wrapper.emitted('done')).toHaveLength(1)
  })

  it('can be opted out, which is what a spec mounting App.vue would do', async () => {
    const wrapper = mount(ExerciseLayout, {
      props: { title: 'x', minutes: 10, autostart: false },
    })
    await vi.advanceTimersByTimeAsync(60_000)
    expect(wrapper.get('[data-testid="exercise-timer-remaining"]').text()).toBe('10:00')
  })
})
