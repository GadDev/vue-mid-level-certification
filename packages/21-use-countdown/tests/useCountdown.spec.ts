import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { type CountdownOptions, useCountdown } from '../src/composables/useCountdown'

let scope: ReturnType<typeof effectScope>

function setup(seconds = 60, options: CountdownOptions = {}) {
  scope = effectScope()
  // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
  return scope.run(() => useCountdown(seconds, options))!
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
})

describe('useCountdown', () => {
  it('starts paused at the full duration', () => {
    const timer = setup(90)
    expect(timer.remaining.value).toBe(90)
    expect(timer.running.value).toBe(false)
    expect(timer.finished.value).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('formats as mm:ss', () => {
    expect(setup(90).formatted.value).toBe('01:30')
    expect(setup(5).formatted.value).toBe('00:05')
    expect(setup(600).formatted.value).toBe('10:00')
  })

  it('ticks once a second while running', () => {
    const timer = setup(10)
    timer.start()
    expect(timer.running.value).toBe(true)

    vi.advanceTimersByTime(3000)
    expect(timer.remaining.value).toBe(7)
    expect(timer.formatted.value).toBe('00:07')
  })

  it('does not tick before the first full second', () => {
    const timer = setup(10)
    timer.start()
    vi.advanceTimersByTime(999)
    expect(timer.remaining.value).toBe(10)
  })

  it('ignores a second start', () => {
    const timer = setup(10)
    timer.start()
    timer.start()
    vi.advanceTimersByTime(2000)
    expect(timer.remaining.value).toBe(8)
    expect(vi.getTimerCount()).toBe(1)
  })

  it('pauses and resumes where it stopped', () => {
    const timer = setup(10)
    timer.start()
    vi.advanceTimersByTime(3000)

    timer.pause()
    expect(timer.running.value).toBe(false)
    vi.advanceTimersByTime(5000)
    expect(timer.remaining.value).toBe(7)

    timer.start()
    vi.advanceTimersByTime(2000)
    expect(timer.remaining.value).toBe(5)
  })

  it('clears its interval when paused', () => {
    const timer = setup(10)
    timer.start()
    timer.pause()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('tolerates a pause while it is not running', () => {
    const timer = setup(10)
    expect(() => timer.pause()).not.toThrow()
    expect(timer.remaining.value).toBe(10)
  })

  it('stops at zero without going negative', () => {
    const timer = setup(3)
    timer.start()
    vi.advanceTimersByTime(10_000)

    expect(timer.remaining.value).toBe(0)
    expect(timer.running.value).toBe(false)
    expect(timer.finished.value).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('calls onDone exactly once', () => {
    const onDone = vi.fn()
    const timer = setup(2, { onDone })
    timer.start()

    vi.advanceTimersByTime(1000)
    expect(onDone).not.toHaveBeenCalled()

    vi.advanceTimersByTime(5000)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('refuses to restart once finished', () => {
    const timer = setup(1)
    timer.start()
    vi.advanceTimersByTime(2000)

    timer.start()
    expect(timer.running.value).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('resets back to the initial duration and stops', () => {
    const timer = setup(10)
    timer.start()
    vi.advanceTimersByTime(4000)

    timer.reset()
    expect(timer.remaining.value).toBe(10)
    expect(timer.running.value).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('resets a finished countdown so it can run again', () => {
    const timer = setup(2)
    timer.start()
    vi.advanceTimersByTime(5000)

    timer.reset()
    expect(timer.finished.value).toBe(false)
    timer.start()
    vi.advanceTimersByTime(1000)
    expect(timer.remaining.value).toBe(1)
  })

  it('adopts a new duration given to reset', () => {
    const timer = setup(10)
    timer.reset(30)
    expect(timer.remaining.value).toBe(30)

    timer.start()
    vi.advanceTimersByTime(1000)
    timer.reset()
    expect(timer.remaining.value).toBe(30)
  })

  it('fires onDone again after a reset', () => {
    const onDone = vi.fn()
    const timer = setup(1, { onDone })
    timer.start()
    vi.advanceTimersByTime(2000)

    timer.reset()
    timer.start()
    vi.advanceTimersByTime(2000)
    expect(onDone).toHaveBeenCalledTimes(2)
  })

  it('drops its interval when the scope stops', () => {
    const timer = setup(60)
    timer.start()
    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('gives two countdowns independent state', () => {
    const a = setup(10)
    const b = scope.run(() => useCountdown(10))
    a.start()
    vi.advanceTimersByTime(3000)
    expect(b?.remaining.value).toBe(10)
  })
})
