import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LOAD_ERROR, useInfiniteScroll } from '../src/composables/useInfiniteScroll'

interface Post {
  id: number
}

/** A promise we resolve by hand, so the test decides when a request finishes. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function page(from: number, size = 20): Post[] {
  return Array.from({ length: size }, (_, index) => ({ id: from + index }))
}

let loadPage: ReturnType<typeof vi.fn>

function setup(size = 20) {
  return useInfiniteScroll<Post>(loadPage as (page: number) => Promise<Post[]>, size)
}

beforeEach(() => {
  loadPage = vi.fn()
})

describe('useInfiniteScroll', () => {
  it('starts empty and has loaded no page', () => {
    const list = setup()
    expect(list.items.value).toEqual([])
    expect(list.page.value).toBe(0)
    expect(list.loading.value).toBe(false)
    expect(list.done.value).toBe(false)
    expect(loadPage).not.toHaveBeenCalled()
  })

  it('loads the first page', async () => {
    const list = setup()
    loadPage.mockResolvedValue(page(1))

    await list.loadMore()
    expect(loadPage).toHaveBeenCalledWith(1)
    expect(list.items.value).toHaveLength(20)
    expect(list.page.value).toBe(1)
    expect(list.loading.value).toBe(false)
  })

  it('appends the following pages in order', async () => {
    const list = setup()
    loadPage.mockResolvedValueOnce(page(1)).mockResolvedValueOnce(page(21))

    await list.loadMore()
    await list.loadMore()
    expect(loadPage).toHaveBeenNthCalledWith(2, 2)
    expect(list.items.value.map(post => post.id).slice(0, 21)).toEqual([
      ...Array.from({ length: 21 }, (_, index) => index + 1),
    ])
  })

  it('is loading while a request is in flight', async () => {
    const list = setup()
    const first = deferred<Post[]>()
    loadPage.mockReturnValue(first.promise)

    const pending = list.loadMore()
    expect(list.loading.value).toBe(true)

    first.resolve(page(1))
    await pending
    expect(list.loading.value).toBe(false)
  })

  it('refuses to fire a second request while one is in flight', async () => {
    const list = setup()
    const first = deferred<Post[]>()
    loadPage.mockReturnValue(first.promise)

    const a = list.loadMore()
    const b = list.loadMore()
    expect(loadPage).toHaveBeenCalledTimes(1)

    first.resolve(page(1))
    await Promise.all([a, b])
    await flushPromises()
    expect(list.items.value).toHaveLength(20)
  })

  it('is done after a short page', async () => {
    const list = setup()
    loadPage.mockResolvedValue(page(1, 7))

    await list.loadMore()
    expect(list.done.value).toBe(true)
    expect(list.items.value).toHaveLength(7)
  })

  it('is done after an empty page', async () => {
    const list = setup()
    loadPage.mockResolvedValueOnce(page(1)).mockResolvedValueOnce([])

    await list.loadMore()
    await list.loadMore()
    expect(list.done.value).toBe(true)
    expect(list.items.value).toHaveLength(20)
  })

  it('sends nothing more once it is done', async () => {
    const list = setup()
    loadPage.mockResolvedValue(page(1, 3))

    await list.loadMore()
    await list.loadMore()
    expect(loadPage).toHaveBeenCalledTimes(1)
  })

  it('reports a failed request without losing the loaded items', async () => {
    const list = setup()
    loadPage.mockResolvedValueOnce(page(1)).mockRejectedValueOnce(new Error('network'))

    await list.loadMore()
    await list.loadMore()

    expect(list.error.value).toBe(LOAD_ERROR)
    expect(list.loading.value).toBe(false)
    expect(list.items.value).toHaveLength(20)
    expect(list.page.value).toBe(1)
  })

  it('retries the page that failed', async () => {
    const list = setup()
    loadPage.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(page(1))

    await list.loadMore()
    await list.loadMore()

    expect(loadPage).toHaveBeenNthCalledWith(2, 1)
    expect(list.error.value).toBe('')
    expect(list.items.value).toHaveLength(20)
  })

  it('resets back to the empty state', async () => {
    const list = setup()
    loadPage.mockResolvedValue(page(1, 5))

    await list.loadMore()
    list.reset()

    expect(list.items.value).toEqual([])
    expect(list.page.value).toBe(0)
    expect(list.done.value).toBe(false)
    expect(list.error.value).toBe('')

    loadPage.mockResolvedValue(page(1))
    await list.loadMore()
    expect(loadPage).toHaveBeenLastCalledWith(1)
  })

  it('honours a custom page size when deciding it is done', async () => {
    const list = setup(5)
    loadPage.mockResolvedValue(page(1, 5))

    await list.loadMore()
    expect(list.done.value).toBe(false)
  })
})
