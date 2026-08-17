import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { payload } from '../src/api/metrics'
import StatsPanel from '../src/components/StatsPanel.vue'

vi.mock('../src/api/metrics', async () => {
  const actual = await vi.importActual<typeof import('../src/api/metrics')>('../src/api/metrics')
  return { ...actual, fetchMetrics: vi.fn() }
})
const { fetchMetrics } = (await import('../src/api/metrics')) as unknown as {
  fetchMetrics: Mock<() => Promise<unknown[]>>
}

function render() {
  return mount(StatsPanel, { global: { plugins: [createPinia()] } })
}

beforeEach(() => {
  setActivePinia(createPinia())
  fetchMetrics.mockReset()
  fetchMetrics.mockResolvedValue(payload)
})

describe('StatsPanel', () => {
  it('shows the loading state first', async () => {
    fetchMetrics.mockReturnValueOnce(new Promise(() => {}))
    const wrapper = render()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="average"]').exists()).toBe(false)
  })

  it('shows the figures once loaded', async () => {
    const wrapper = render()
    await flushPromises()

    expect(wrapper.get('[data-testid="average"]').text()).toBe('133.33')
    expect(wrapper.get('[data-testid="max"]').text()).toBe('Thu')
    expect(wrapper.get('[data-testid="min"]').text()).toBe('Tue')
    expect(wrapper.get('[data-testid="count"]').text()).toBe('3')
  })

  it('shows the empty state when the API returns nothing usable', async () => {
    fetchMetrics.mockResolvedValueOnce([])
    const wrapper = render()
    await flushPromises()

    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="average"]').exists()).toBe(false)
  })

  it('shows an error when the load fails', async () => {
    fetchMetrics.mockRejectedValueOnce(new Error('offline'))
    const wrapper = render()
    await flushPromises()

    expect(wrapper.get('[data-testid="error"]').text()).not.toBe('')
    expect(wrapper.find('[data-testid="average"]').exists()).toBe(false)
  })
})
