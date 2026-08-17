import { beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useLocalStorage } from '../src/composables/useLocalStorage'

interface Note {
  text: string
  pinned: boolean
}

function inScope<T>(fn: () => T) {
  const scope = effectScope()
  // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
  return { value: scope.run(fn)!, scope }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('useLocalStorage', () => {
  it('falls back to the initial value when nothing is stored', () => {
    const { value: note } = inScope(() =>
      useLocalStorage<Note>('note', { text: '', pinned: false })
    )
    expect(note.value).toEqual({ text: '', pinned: false })
  })

  it('reads an existing value', () => {
    window.localStorage.setItem('note', JSON.stringify({ text: 'hi', pinned: true }))
    const { value: note } = inScope(() =>
      useLocalStorage<Note>('note', { text: '', pinned: false })
    )
    expect(note.value).toEqual({ text: 'hi', pinned: true })
  })

  it('falls back when the stored value is corrupt', () => {
    window.localStorage.setItem('note', '{not json')
    const { value: note } = inScope(() =>
      useLocalStorage<Note>('note', { text: '', pinned: false })
    )
    expect(note.value).toEqual({ text: '', pinned: false })
  })

  it('persists a replaced value', async () => {
    const { value: count } = inScope(() => useLocalStorage('count', 0))
    count.value = 5
    await nextTick()

    expect(window.localStorage.getItem('count')).toBe('5')
  })

  it('persists a nested change (deep watch)', async () => {
    const { value: note } = inScope(() =>
      useLocalStorage<Note>('note', { text: '', pinned: false })
    )
    note.value.text = 'buy milk'
    await nextTick()

    expect(JSON.parse(window.localStorage.getItem('note') as string)).toEqual({
      text: 'buy milk',
      pinned: false,
    })
  })

  it('keeps different keys independent', async () => {
    const { value: a } = inScope(() => useLocalStorage('a', 1))
    const { value: b } = inScope(() => useLocalStorage('b', 2))
    a.value = 10
    await nextTick()

    expect(window.localStorage.getItem('a')).toBe('10')
    expect(window.localStorage.getItem('b')).toBe(null)
    expect(b.value).toBe(2)
  })

  it('picks up a change made in another tab', () => {
    const { value: count } = inScope(() => useLocalStorage('count', 0))

    window.localStorage.setItem('count', '42')
    window.dispatchEvent(new StorageEvent('storage', { key: 'count', newValue: '42' }))

    expect(count.value).toBe(42)
  })

  it('ignores storage events for other keys', () => {
    const { value: count } = inScope(() => useLocalStorage('count', 0))

    window.localStorage.setItem('other', '99')
    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: '99' }))

    expect(count.value).toBe(0)
  })

  it('removes its storage listener when the scope is disposed', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { value: count, scope } = inScope(() => useLocalStorage('count', 0))

    scope.stop()
    expect(remove).toHaveBeenCalledWith('storage', expect.any(Function))

    window.localStorage.setItem('count', '7')
    window.dispatchEvent(new StorageEvent('storage', { key: 'count', newValue: '7' }))
    expect(count.value).toBe(0)

    remove.mockRestore()
  })

  it('stops persisting once the scope is disposed', async () => {
    const { value: count, scope } = inScope(() => useLocalStorage('count', 0))
    scope.stop()

    count.value = 3
    await nextTick()
    expect(window.localStorage.getItem('count')).toBe(null)
  })
})
