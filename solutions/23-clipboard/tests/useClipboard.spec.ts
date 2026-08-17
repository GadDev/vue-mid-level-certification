import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { COPY_ERROR, UNSUPPORTED, useClipboard } from '../src/composables/useClipboard'

let scope: ReturnType<typeof effectScope>
let write: ReturnType<typeof vi.fn>

function setup(
  options: { timeout?: number; write?: ((text: string) => Promise<void>) | null } = {}
) {
  const { write: injected = write, timeout = 2000 } = options
  scope = effectScope()
  // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
  return scope.run(() => useClipboard({ timeout, ...(injected ? { write: injected } : {}) }))!
}

beforeEach(() => {
  vi.useFakeTimers()
  write = vi.fn(async () => {})
})

afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useClipboard', () => {
  it('starts idle', () => {
    const clipboard = setup()
    expect(clipboard.copied.value).toBe(false)
    expect(clipboard.error.value).toBe('')
    expect(clipboard.isSupported.value).toBe(true)
  })

  it('writes the text and flashes copied', async () => {
    const clipboard = setup()
    await expect(clipboard.copy('hello')).resolves.toBe(true)
    expect(write).toHaveBeenCalledWith('hello')
    expect(clipboard.copied.value).toBe(true)
  })

  it('clears the flash after the timeout', async () => {
    const clipboard = setup({ timeout: 2000 })
    await clipboard.copy('hello')

    await vi.advanceTimersByTimeAsync(1999)
    expect(clipboard.copied.value).toBe(true)

    await vi.advanceTimersByTimeAsync(1)
    expect(clipboard.copied.value).toBe(false)
  })

  it('restarts the window instead of stacking timers', async () => {
    const clipboard = setup({ timeout: 2000 })
    await clipboard.copy('one')
    await vi.advanceTimersByTimeAsync(1500)

    await clipboard.copy('two')
    expect(vi.getTimerCount()).toBe(1)

    await vi.advanceTimersByTimeAsync(1500)
    expect(clipboard.copied.value).toBe(true)

    await vi.advanceTimersByTimeAsync(500)
    expect(clipboard.copied.value).toBe(false)
  })

  it('refuses empty text', async () => {
    const clipboard = setup()
    await expect(clipboard.copy('')).resolves.toBe(false)
    await expect(clipboard.copy('   ')).resolves.toBe(false)
    expect(write).not.toHaveBeenCalled()
    expect(clipboard.copied.value).toBe(false)
  })

  it('reports a rejected write', async () => {
    write.mockRejectedValueOnce(new Error('denied'))
    const clipboard = setup()

    await expect(clipboard.copy('hello')).resolves.toBe(false)
    expect(clipboard.copied.value).toBe(false)
    expect(clipboard.error.value).toBe(COPY_ERROR)
  })

  it('clears the error on the next successful copy', async () => {
    write.mockRejectedValueOnce(new Error('denied'))
    const clipboard = setup()
    await clipboard.copy('hello')
    await clipboard.copy('hello')
    expect(clipboard.error.value).toBe('')
    expect(clipboard.copied.value).toBe(true)
  })

  it('falls back to the browser clipboard', async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const clipboard = setup({ write: null })
    expect(clipboard.isSupported.value).toBe(true)
    await clipboard.copy('hello')
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('degrades when there is no clipboard at all', async () => {
    vi.stubGlobal('navigator', {})
    const clipboard = setup({ write: null })

    expect(clipboard.isSupported.value).toBe(false)
    await expect(clipboard.copy('hello')).resolves.toBe(false)
    expect(clipboard.error.value).toBe(UNSUPPORTED)
    expect(clipboard.copied.value).toBe(false)
  })

  it('drops its pending timer when the scope stops', async () => {
    const clipboard = setup()
    await clipboard.copy('hello')
    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('gives two instances independent flashes', async () => {
    const a = setup()
    const b = scope.run(() => useClipboard({ write }))
    await a.copy('hello')
    expect(b?.copied.value).toBe(false)
  })
})
