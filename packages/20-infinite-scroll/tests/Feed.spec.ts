import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import type { Post } from '../src/api/feed'
import Feed from '../src/components/Feed.vue'

vi.mock('../src/api/feed', () => ({ PAGE_SIZE: 20, fetchPosts: vi.fn() }))
const { fetchPosts } = (await import('../src/api/feed')) as unknown as {
  fetchPosts: Mock<(page: number) => Promise<Post[]>>
}

function page(from: number, size = 20): Post[] {
  return Array.from({ length: size }, (_, index) => ({
    id: from + index,
    title: `Post ${from + index}`,
  }))
}

async function render() {
  const wrapper = mount(Feed)
  await flushPromises()
  return wrapper
}

function posts(wrapper: VueWrapper): number {
  return wrapper.findAll('[data-testid="post"]').length
}

/** jsdom has no layout, so the scroll geometry is set by hand. */
async function scrollTo(wrapper: VueWrapper, scrollTop: number) {
  const feed = wrapper.get('[data-testid="feed"]')
  for (const [key, value] of Object.entries({ scrollTop, clientHeight: 400, scrollHeight: 1000 })) {
    Object.defineProperty(feed.element, key, { value, configurable: true })
  }
  await feed.trigger('scroll')
  await flushPromises()
}

beforeEach(() => {
  fetchPosts.mockReset()
  fetchPosts.mockResolvedValue(page(1))
})

describe('Feed', () => {
  it('loads the first page on mount', async () => {
    const wrapper = await render()
    expect(fetchPosts).toHaveBeenCalledWith(1)
    expect(posts(wrapper)).toBe(20)
  })

  it('shows the loading state only while a request is in flight', async () => {
    fetchPosts.mockImplementation(() => new Promise(() => {}))
    const wrapper = mount(Feed)
    await flushPromises()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="done"]').exists()).toBe(false)
  })

  it('appends the next page from the button', async () => {
    const wrapper = await render()
    fetchPosts.mockResolvedValueOnce(page(21))

    await wrapper.get('[data-testid="more"]').trigger('click')
    await flushPromises()
    expect(posts(wrapper)).toBe(40)
  })

  it('loads more when the container is scrolled near its bottom', async () => {
    const wrapper = await render()
    fetchPosts.mockResolvedValueOnce(page(21))

    await scrollTo(wrapper, 550)
    expect(fetchPosts).toHaveBeenCalledTimes(2)
    expect(posts(wrapper)).toBe(40)
  })

  it('ignores a scroll far from the bottom', async () => {
    const wrapper = await render()
    await scrollTo(wrapper, 100)
    expect(fetchPosts).toHaveBeenCalledTimes(1)
  })

  it('announces the end of the feed and drops the button', async () => {
    fetchPosts.mockResolvedValue(page(1, 4))
    const wrapper = await render()

    expect(wrapper.find('[data-testid="done"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="more"]').exists()).toBe(false)
  })

  it('shows an error and lets the user retry', async () => {
    fetchPosts.mockRejectedValueOnce(new Error('network'))
    const wrapper = await render()
    expect(wrapper.get('[data-testid="error"]').text()).not.toBe('')

    fetchPosts.mockResolvedValueOnce(page(1))
    await wrapper.get('[data-testid="more"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(false)
    expect(posts(wrapper)).toBe(20)
  })
})
