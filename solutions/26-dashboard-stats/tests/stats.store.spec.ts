import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { LOAD_ERROR, payload, type Reading } from '../src/api/metrics'
import { useStatsStore } from '../src/stores/stats'

vi.mock('../src/api/metrics', async () => {
  const actual = await vi.importActual<typeof import('../src/api/metrics')>('../src/api/metrics')
  return { ...actual, fetchMetrics: vi.fn() }
})
const { fetchMetrics } = (await import('../src/api/metrics')) as unknown as {
  fetchMetrics: Mock<() => Promise<unknown[]>>
}

function readings(...values: number[]): Reading[] {
  return values.map((value, index) => ({ id: index + 1, label: `#${index + 1}`, value }))
}

beforeEach(() => {
  setActivePinia(createPinia())
  fetchMetrics.mockReset()
  fetchMetrics.mockResolvedValue(payload)
})

describe('stats store', () => {
  it('starts empty', () => {
    const stats = useStatsStore()
    expect(stats.readings).toEqual([])
    expect(stats.count).toBe(0)
    expect(stats.average).toBe(0)
    expect(stats.max).toBeNull()
    expect(stats.min).toBeNull()
  })

  it('computes the average, max and min', () => {
    const stats = useStatsStore()
    stats.setData(readings(10, 30, 20))

    expect(stats.count).toBe(3)
    expect(stats.average).toBe(20)
    expect(stats.max?.value).toBe(30)
    expect(stats.min?.value).toBe(10)
  })

  it('rounds the average to two decimals', () => {
    const stats = useStatsStore()
    stats.setData(readings(10, 20, 25))
    expect(stats.average).toBe(18.33)
  })

  it('returns the whole reading for max and min, not just the number', () => {
    const stats = useStatsStore()
    stats.setData([
      { id: 7, label: 'Mon', value: 5 },
      { id: 8, label: 'Tue', value: 9 },
    ])
    expect(stats.max).toEqual({ id: 8, label: 'Tue', value: 9 })
    expect(stats.min).toEqual({ id: 7, label: 'Mon', value: 5 })
  })

  it('keeps the first of equal extremes', () => {
    const stats = useStatsStore()
    stats.setData([
      { id: 1, label: 'a', value: 4 },
      { id: 2, label: 'b', value: 4 },
    ])
    expect(stats.max?.id).toBe(1)
    expect(stats.min?.id).toBe(1)
  })

  it('handles negative values', () => {
    const stats = useStatsStore()
    stats.setData(readings(-5, -1, -9))
    expect(stats.average).toBe(-5)
    expect(stats.max?.value).toBe(-1)
    expect(stats.min?.value).toBe(-9)
  })

  it('drops entries that are not readings', () => {
    const stats = useStatsStore()
    stats.setData([
      { id: 1, label: 'ok', value: 10 },
      { id: 2, label: 'text', value: 'n/a' },
      { id: 3, label: 'nan', value: Number.NaN },
      { id: 4, label: 'infinite', value: Number.POSITIVE_INFINITY },
      null,
      'nope',
      { label: 'no id', value: 3 },
    ])

    expect(stats.count).toBe(1)
    expect(stats.average).toBe(10)
  })

  it('replaces the previous data', () => {
    const stats = useStatsStore()
    stats.setData(readings(1, 2, 3))
    stats.setData(readings(100))
    expect(stats.count).toBe(1)
    expect(stats.average).toBe(100)
  })

  it('loads from the API and keeps only the usable readings', async () => {
    const stats = useStatsStore()
    await stats.load()

    expect(stats.count).toBe(3)
    expect(stats.average).toBe(133.33)
    expect(stats.max?.label).toBe('Thu')
    expect(stats.min?.label).toBe('Tue')
    expect(stats.loading).toBe(false)
    expect(stats.error).toBe('')
  })

  it('is loading while the request runs', async () => {
    const stats = useStatsStore()
    fetchMetrics.mockReturnValueOnce(new Promise(() => {}))
    stats.load()
    expect(stats.loading).toBe(true)
  })

  it('reports a failed load', async () => {
    fetchMetrics.mockRejectedValueOnce(new Error('offline'))
    const stats = useStatsStore()
    await stats.load()

    expect(stats.error).toBe(LOAD_ERROR)
    expect(stats.loading).toBe(false)
    expect(stats.count).toBe(0)
  })

  it('clears a previous error on the next load', async () => {
    fetchMetrics.mockRejectedValueOnce(new Error('offline'))
    const stats = useStatsStore()
    await stats.load()
    await stats.load()
    expect(stats.error).toBe('')
    expect(stats.count).toBe(3)
  })

  it('resets', async () => {
    const stats = useStatsStore()
    await stats.load()
    stats.reset()

    expect(stats.readings).toEqual([])
    expect(stats.average).toBe(0)
    expect(stats.max).toBeNull()
    expect(stats.error).toBe('')
  })

  it('is a singleton per pinia instance', () => {
    useStatsStore().setData(readings(5))
    expect(useStatsStore().count).toBe(1)

    setActivePinia(createPinia())
    expect(useStatsStore().count).toBe(0)
  })
})
