import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useToasts } from '../src/composables/useToasts'

let scope: ReturnType<typeof effectScope>

function setup(duration?: number) {
  scope = effectScope()
  // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
  return scope.run(() => useToasts(duration))!
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
})

describe('useToasts', () => {
  it('starts with an empty queue', () => {
    expect(setup().toasts.value).toEqual([])
  })

  it('queues a toast and returns its id', () => {
    const queue = setup()
    const id = queue.notify('Saved')
    expect(queue.toasts.value).toEqual([{ id, message: 'Saved', type: 'info' }])
  })

  it('takes an explicit type', () => {
    const queue = setup()
    queue.notify('Boom', 'error')
    expect(queue.toasts.value[0].type).toBe('error')
  })

  it('preserves queue order', () => {
    const queue = setup()
    queue.notify('first')
    queue.notify('second')
    queue.notify('third')
    expect(queue.toasts.value.map(toast => toast.message)).toEqual(['first', 'second', 'third'])
  })

  it('gives identical messages distinct ids', () => {
    const queue = setup()
    const a = queue.notify('Saved')
    const b = queue.notify('Saved')
    expect(a).not.toBe(b)
    expect(queue.toasts.value).toHaveLength(2)
  })

  it('auto-dismisses after the duration', async () => {
    const queue = setup(3000)
    queue.notify('Saved')

    await vi.advanceTimersByTimeAsync(2999)
    expect(queue.toasts.value).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(queue.toasts.value).toEqual([])
  })

  it('gives every toast its own timer', async () => {
    const queue = setup(3000)
    queue.notify('first')
    await vi.advanceTimersByTimeAsync(1000)
    queue.notify('second')

    await vi.advanceTimersByTimeAsync(2000)
    expect(queue.toasts.value.map(toast => toast.message)).toEqual(['second'])

    await vi.advanceTimersByTimeAsync(1000)
    expect(queue.toasts.value).toEqual([])
  })

  it('dismisses on demand without touching the others', async () => {
    const queue = setup(3000)
    const first = queue.notify('first')
    queue.notify('second')

    queue.dismiss(first)
    expect(queue.toasts.value.map(toast => toast.message)).toEqual(['second'])

    await vi.advanceTimersByTimeAsync(3000)
    expect(queue.toasts.value).toEqual([])
  })

  it('cancels the timer of a dismissed toast', () => {
    const queue = setup(3000)
    queue.dismiss(queue.notify('Saved'))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores an unknown id', () => {
    const queue = setup()
    queue.notify('Saved')
    expect(() => queue.dismiss(999)).not.toThrow()
    expect(queue.toasts.value).toHaveLength(1)
  })

  it('clears the queue and its timers', () => {
    const queue = setup(3000)
    queue.notify('first')
    queue.notify('second')

    queue.clear()
    expect(queue.toasts.value).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps sticky toasts when the duration is zero', async () => {
    const queue = setup(0)
    queue.notify('Stays put')

    await vi.advanceTimersByTimeAsync(60_000)
    expect(queue.toasts.value).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('drops pending timers when the scope stops', () => {
    const queue = setup(3000)
    queue.notify('first')
    queue.notify('second')

    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('gives two queues independent state', () => {
    const a = setup(3000)
    const b = scope.run(() => useToasts(3000))
    a.notify('only mine')
    expect(b?.toasts.value).toEqual([])
  })
})
