import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import type { Post } from '../src/api/posts'
import PostViewer from '../src/components/PostViewer.vue'

vi.mock('../src/api/posts', () => ({ fetchPost: vi.fn() }))
const { fetchPost } = (await import('../src/api/posts')) as unknown as {
  fetchPost: Mock<(id: string) => Promise<Post>>
}

function render() {
  return mount(PostViewer)
}

beforeEach(() => {
  fetchPost.mockReset()
  fetchPost.mockImplementation(async (id: string) => ({ id, title: `Post ${id}` }))
})

describe('PostViewer', () => {
  it('shows nothing before the first request', () => {
    const wrapper = render()
    expect(wrapper.find('[data-testid="title"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
  })

  it('shows the loading state, then the post', async () => {
    fetchPost.mockReturnValueOnce(new Promise(() => {}))
    const wrapper = render()
    await wrapper.get('[data-testid="load-1"]').trigger('click')
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)

    const second = render()
    await second.get('[data-testid="load-2"]').trigger('click')
    await flushPromises()
    expect(second.get('[data-testid="title"]').text()).toBe('Post 2')
    expect(second.find('[data-testid="loading"]').exists()).toBe(false)
  })

  it('does not re-request a post it already has', async () => {
    const wrapper = render()
    await wrapper.get('[data-testid="load-1"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="load-2"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="load-1"]').trigger('click')
    await flushPromises()

    expect(fetchPost).toHaveBeenCalledTimes(2)
    expect(wrapper.get('[data-testid="title"]').text()).toBe('Post 1')
  })

  it('offers a retry after a failure', async () => {
    fetchPost.mockRejectedValueOnce(new Error('not found'))
    const wrapper = render()
    await wrapper.get('[data-testid="load-404"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="error"]').text()).not.toBe('')
    expect(wrapper.find('[data-testid="title"]').exists()).toBe(false)

    await wrapper.get('[data-testid="retry"]').trigger('click')
    await flushPromises()
    expect(fetchPost).toHaveBeenLastCalledWith('404')
    expect(wrapper.get('[data-testid="title"]').text()).toBe('Post 404')
  })
})
