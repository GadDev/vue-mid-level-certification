import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import type { User } from '../src/api/users'
import UserSearch from '../src/components/UserSearch.vue'

vi.mock('../src/api/users', () => ({ searchUsers: vi.fn() }))
const { searchUsers } = (await import('../src/api/users')) as unknown as {
  searchUsers: Mock<(query: string, signal?: AbortSignal) => Promise<User[]>>
}

const alice: User = { id: 1, name: 'Alice Johnson', role: 'Designer' }

function render() {
  return mount(UserSearch)
}

type Wrapper = ReturnType<typeof render>

async function type(wrapper: Wrapper, value: string) {
  await wrapper.get('[data-testid="search"]').setValue(value)
}

async function advance(ms: number) {
  await vi.advanceTimersByTimeAsync(ms)
  await flushPromises()
}

beforeEach(() => {
  vi.useFakeTimers()
  searchUsers.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('UserSearch', () => {
  it('renders nothing but the input up front', () => {
    const wrapper = render()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-testid="user"]')).toHaveLength(0)
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false)
  })

  it('shows the loading state, then the results', async () => {
    searchUsers.mockResolvedValue([alice])
    const wrapper = render()

    await type(wrapper, 'ali')
    expect(wrapper.get('[data-testid="loading"]').text()).not.toBe('')

    await advance(300)
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-testid="user"]')).toHaveLength(1)
    expect(wrapper.get('[data-testid="user"]').text()).toContain('Alice Johnson')
    expect(wrapper.get('[data-testid="count"]').text()).toBe('1')
  })

  it('shows an empty state when the search returns nothing', async () => {
    searchUsers.mockResolvedValue([])
    const wrapper = render()

    await type(wrapper, 'zzz')
    await advance(300)

    expect(wrapper.get('[data-testid="empty"]').text()).not.toBe('')
    expect(wrapper.get('[data-testid="count"]').text()).toBe('0')
  })

  it('shows an error with role="alert" when the request fails', async () => {
    searchUsers.mockRejectedValue(new Error('boom'))
    const wrapper = render()

    await type(wrapper, 'boom')
    await advance(300)

    const error = wrapper.get('[data-testid="error"]')
    expect(error.attributes('role')).toBe('alert')
    expect(wrapper.findAll('[data-testid="user"]')).toHaveLength(0)
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
  })

  it('never shows loading and results at the same time', async () => {
    searchUsers.mockResolvedValue([alice])
    const wrapper = render()

    await type(wrapper, 'ali')
    expect(wrapper.findAll('[data-testid="user"]')).toHaveLength(0)

    await advance(300)
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
    expect(wrapper.findAll('[data-testid="user"]')).toHaveLength(1)
  })

  it('clears everything when the input is emptied', async () => {
    searchUsers.mockResolvedValue([alice])
    const wrapper = render()

    await type(wrapper, 'ali')
    await advance(300)
    expect(wrapper.findAll('[data-testid="user"]')).toHaveLength(1)

    await type(wrapper, '')
    await advance(300)

    expect(wrapper.findAll('[data-testid="user"]')).toHaveLength(0)
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
  })

  it('sends one request for a burst of keystrokes', async () => {
    searchUsers.mockResolvedValue([alice])
    const wrapper = render()

    await type(wrapper, 'a')
    await type(wrapper, 'al')
    await type(wrapper, 'ali')
    await advance(300)

    expect(searchUsers).toHaveBeenCalledTimes(1)
  })
})
