import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import type { User } from '../src/api/users'
import { SEARCH_ERROR, useUserSearch } from '../src/composables/useUserSearch'

vi.mock('../src/api/users', () => ({ searchUsers: vi.fn() }))
const { searchUsers } = (await import('../src/api/users')) as unknown as {
  searchUsers: Mock<(query: string, signal?: AbortSignal) => Promise<User[]>>
}

const alice: User = { id: 1, name: 'Alice Johnson', role: 'Designer' }
const bob: User = { id: 2, name: 'Bob Smith', role: 'Developer' }

/** A promise we resolve by hand, so tests control when a request finishes. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

let scope: ReturnType<typeof effectScope>

function setup(delay = 300) {
  scope = effectScope()
  // biome-ignore lint/style/noNonNullAssertion: the scope always returns a value here
  return scope.run(() => useUserSearch(delay))!
}

/** Push the debounce past its deadline and let the microtasks settle. */
async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

beforeEach(() => {
  vi.useFakeTimers()
  searchUsers.mockReset()
})

afterEach(() => {
  scope?.stop()
  vi.useRealTimers()
})

describe('useUserSearch', () => {
  it('starts idle and issues no request', () => {
    const search = setup()
    expect(search.query.value).toBe('')
    expect(search.results.value).toEqual([])
    expect(search.loading.value).toBe(false)
    expect(search.error.value).toBe('')
    expect(searchUsers).not.toHaveBeenCalled()
  })

  it('debounces: fast typing produces exactly one request', async () => {
    searchUsers.mockResolvedValue([alice])
    const search = setup(300)

    search.query.value = 'a'
    await nextTick()
    search.query.value = 'al'
    await nextTick()
    search.query.value = 'ali'
    await nextTick()

    await advance(299)
    expect(searchUsers).not.toHaveBeenCalled()

    await advance(2)
    expect(searchUsers).toHaveBeenCalledTimes(1)
    expect(searchUsers.mock.calls[0][0]).toBe('ali')
    expect(search.results.value).toEqual([alice])
  })

  it('shows loading while the request is in flight', async () => {
    const pending = deferred<User[]>()
    searchUsers.mockReturnValue(pending.promise)
    const search = setup(300)

    search.query.value = 'ali'
    await nextTick()
    expect(search.loading.value).toBe(true)

    await advance(300)
    expect(search.loading.value).toBe(true)

    pending.resolve([alice])
    await flushPromises()
    expect(search.loading.value).toBe(false)
    expect(search.results.value).toEqual([alice])
  })

  it('trims the query before searching', async () => {
    searchUsers.mockResolvedValue([alice])
    const search = setup(300)

    search.query.value = '   alice   '
    await nextTick()
    await advance(300)

    expect(searchUsers.mock.calls[0][0]).toBe('alice')
  })

  it.each([
    ['an empty query', ''],
    ['a whitespace-only query', '    '],
  ])('issues no request for %s', async (_label, value) => {
    searchUsers.mockResolvedValue([alice])
    const search = setup(300)

    search.query.value = value
    await nextTick()
    await advance(500)

    expect(searchUsers).not.toHaveBeenCalled()
    expect(search.loading.value).toBe(false)
  })

  it('clears the results when the query is emptied', async () => {
    searchUsers.mockResolvedValue([alice])
    const search = setup(300)

    search.query.value = 'ali'
    await nextTick()
    await advance(300)
    expect(search.results.value).toEqual([alice])

    search.query.value = ''
    await nextTick()
    await advance(300)

    expect(search.results.value).toEqual([])
    expect(search.loading.value).toBe(false)
    expect(searchUsers).toHaveBeenCalledTimes(1)
  })

  it('passes an abort signal and aborts the in-flight request', async () => {
    const pending = deferred<User[]>()
    searchUsers.mockReturnValue(pending.promise)
    const search = setup(300)

    search.query.value = 'ali'
    await nextTick()
    await advance(300)

    const signal = searchUsers.mock.calls[0][1]
    expect(signal).toBeInstanceOf(AbortSignal)
    expect(signal?.aborted).toBe(false)

    search.query.value = 'bob'
    await nextTick()
    expect(signal?.aborted).toBe(true)
  })

  it('ignores a stale response that resolves after a newer one', async () => {
    const first = deferred<User[]>()
    const second = deferred<User[]>()
    searchUsers.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const search = setup(300)

    search.query.value = 'ali'
    await nextTick()
    await advance(300)

    search.query.value = 'bob'
    await nextTick()
    await advance(300)

    second.resolve([bob])
    await flushPromises()
    expect(search.results.value).toEqual([bob])

    // The first request finishes last — it must not overwrite the newer result.
    first.resolve([alice])
    await flushPromises()
    expect(search.results.value).toEqual([bob])
    expect(search.loading.value).toBe(false)
  })

  it('reports an error and clears the results when a request fails', async () => {
    searchUsers.mockRejectedValue(new Error('boom'))
    const search = setup(300)

    search.query.value = 'boom'
    await nextTick()
    await advance(300)

    expect(search.error.value).toBe(SEARCH_ERROR)
    expect(search.results.value).toEqual([])
    expect(search.loading.value).toBe(false)
  })

  it('clears a previous error on the next successful search', async () => {
    searchUsers.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce([alice])
    const search = setup(300)

    search.query.value = 'boom'
    await nextTick()
    await advance(300)
    expect(search.error.value).toBe(SEARCH_ERROR)

    search.query.value = 'ali'
    await nextTick()
    await advance(300)

    expect(search.error.value).toBe('')
    expect(search.results.value).toEqual([alice])
  })

  it('does not report an aborted request as an error', async () => {
    const pending = deferred<User[]>()
    searchUsers.mockReturnValueOnce(pending.promise).mockResolvedValueOnce([bob])
    const search = setup(300)

    search.query.value = 'ali'
    await nextTick()
    await advance(300)

    search.query.value = 'bob'
    await nextTick()
    pending.reject(new DOMException('Aborted', 'AbortError'))
    await advance(300)

    expect(search.error.value).toBe('')
    expect(search.results.value).toEqual([bob])
  })

  it('cancels pending work when the scope is stopped', async () => {
    searchUsers.mockResolvedValue([alice])
    const search = setup(300)

    search.query.value = 'ali'
    await nextTick()
    scope.stop()
    await advance(500)

    expect(searchUsers).not.toHaveBeenCalled()
  })
})
