import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FETCH_ERROR, useFetch } from '../src/composables/useFetch'

interface Post {
  id: string
  title: string
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

let load: ReturnType<typeof vi.fn>

function setup() {
  return useFetch<Post>(load as (key: string) => Promise<Post>)
}

function post(id: string): Post {
  return { id, title: `Post ${id}` }
}

beforeEach(() => {
  load = vi.fn(async (id: string) => post(id))
})

describe('useFetch', () => {
  it('starts idle', () => {
    const fetcher = setup()
    expect(fetcher.data.value).toBeNull()
    expect(fetcher.loading.value).toBe(false)
    expect(fetcher.error.value).toBe('')
    expect(fetcher.key.value).toBeNull()
    expect(load).not.toHaveBeenCalled()
  })

  it('loads a key', async () => {
    const fetcher = setup()
    await fetcher.load('1')
    expect(load).toHaveBeenCalledWith('1')
    expect(fetcher.data.value).toEqual(post('1'))
    expect(fetcher.key.value).toBe('1')
    expect(fetcher.loading.value).toBe(false)
  })

  it('is loading while the request is in flight', async () => {
    const pending = deferred<Post>()
    load.mockReturnValueOnce(pending.promise)
    const fetcher = setup()

    const request = fetcher.load('1')
    expect(fetcher.loading.value).toBe(true)
    expect(fetcher.data.value).toBeNull()

    pending.resolve(post('1'))
    await request
    expect(fetcher.loading.value).toBe(false)
  })

  it('serves a repeated key from the cache', async () => {
    const fetcher = setup()
    await fetcher.load('1')
    await fetcher.load('2')
    await fetcher.load('1')

    expect(load).toHaveBeenCalledTimes(2)
    expect(fetcher.data.value).toEqual(post('1'))
  })

  it('never enters the loading state for a cached key', async () => {
    const fetcher = setup()
    await fetcher.load('1')

    const request = fetcher.load('1')
    expect(fetcher.loading.value).toBe(false)
    await request
  })

  it('reports a failure and keeps no cache entry for it', async () => {
    load.mockRejectedValueOnce(new Error('boom'))
    const fetcher = setup()

    await fetcher.load('1')
    expect(fetcher.error.value).toBe(FETCH_ERROR)
    expect(fetcher.data.value).toBeNull()
    expect(fetcher.loading.value).toBe(false)

    await fetcher.load('1')
    expect(load).toHaveBeenCalledTimes(2)
    expect(fetcher.error.value).toBe('')
    expect(fetcher.data.value).toEqual(post('1'))
  })

  it('clears a previous error on the next success', async () => {
    load.mockRejectedValueOnce(new Error('boom'))
    const fetcher = setup()
    await fetcher.load('1')
    await fetcher.load('2')
    expect(fetcher.error.value).toBe('')
  })

  it('retries the last key, bypassing the cache', async () => {
    const fetcher = setup()
    await fetcher.load('1')
    await fetcher.retry()

    expect(load).toHaveBeenCalledTimes(2)
    expect(load).toHaveBeenLastCalledWith('1')
  })

  it('does nothing when retrying before anything was loaded', async () => {
    const fetcher = setup()
    await fetcher.retry()
    expect(load).not.toHaveBeenCalled()
  })

  it('refreshes the cache with the retried value', async () => {
    const fetcher = setup()
    await fetcher.load('1')

    load.mockResolvedValueOnce({ id: '1', title: 'Edited' })
    await fetcher.retry()
    expect(fetcher.data.value).toEqual({ id: '1', title: 'Edited' })

    await fetcher.load('2')
    await fetcher.load('1')
    expect(fetcher.data.value).toEqual({ id: '1', title: 'Edited' })
    expect(load).toHaveBeenCalledTimes(3)
  })

  it('invalidates one key', async () => {
    const fetcher = setup()
    await fetcher.load('1')
    await fetcher.load('2')

    fetcher.invalidate('1')
    await fetcher.load('1')
    await fetcher.load('2')
    expect(load).toHaveBeenCalledTimes(3)
  })

  it('invalidates everything', async () => {
    const fetcher = setup()
    await fetcher.load('1')
    await fetcher.load('2')

    fetcher.invalidate()
    await fetcher.load('1')
    await fetcher.load('2')
    expect(load).toHaveBeenCalledTimes(4)
  })

  it('ignores a stale response when a newer key was requested', async () => {
    const slow = deferred<Post>()
    const fast = deferred<Post>()
    load.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise)
    const fetcher = setup()

    const first = fetcher.load('1')
    const second = fetcher.load('2')

    fast.resolve(post('2'))
    await second
    slow.resolve(post('1'))
    await first
    await flushPromises()

    expect(fetcher.key.value).toBe('2')
    expect(fetcher.data.value).toEqual(post('2'))
    expect(fetcher.loading.value).toBe(false)
  })

  it('ignores a stale failure', async () => {
    const slow = deferred<Post>()
    const fast = deferred<Post>()
    load.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise)
    const fetcher = setup()

    const first = fetcher.load('1')
    const second = fetcher.load('2')

    fast.resolve(post('2'))
    await second
    slow.reject(new Error('boom'))
    await first
    await flushPromises()

    expect(fetcher.error.value).toBe('')
    expect(fetcher.data.value).toEqual(post('2'))
  })

  it('gives two fetchers separate caches', async () => {
    const a = setup()
    const b = setup()
    await a.load('1')
    await b.load('1')
    expect(load).toHaveBeenCalledTimes(2)
  })
})
