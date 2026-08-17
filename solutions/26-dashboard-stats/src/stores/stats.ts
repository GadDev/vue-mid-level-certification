import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchMetrics, LOAD_ERROR, type Reading } from '../api/metrics'

function isReading(entry: unknown): entry is Reading {
  if (typeof entry !== 'object' || entry === null) return false
  const candidate = entry as Record<string, unknown>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.label === 'string' &&
    typeof candidate.value === 'number' &&
    Number.isFinite(candidate.value)
  )
}

/** Extreme by comparator, keeping the first of equal values. */
function extreme(list: Reading[], wins: (a: number, b: number) => boolean): Reading | null {
  return list.reduce<Reading | null>(
    (best, current) => (best === null || wins(current.value, best.value) ? current : best),
    null
  )
}

export const useStatsStore = defineStore('stats', () => {
  const readings = ref<Reading[]>([])
  const loading = ref(false)
  const error = ref('')

  const count = computed(() => readings.value.length)

  const average = computed(() => {
    if (readings.value.length === 0) return 0
    const total = readings.value.reduce((sum, reading) => sum + reading.value, 0)
    // Round in the getter, not the template: every consumer wants the same number.
    return Math.round((total / readings.value.length) * 100) / 100
  })

  // `wins` is strict, so ties keep the first entry.
  const max = computed(() => extreme(readings.value, (a, b) => a > b))
  const min = computed(() => extreme(readings.value, (a, b) => a < b))

  /** Keeps only the entries that really are readings with a finite value. */
  function setData(raw: unknown[]): void {
    readings.value = raw.filter(isReading)
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      setData(await fetchMetrics())
      error.value = ''
    } catch {
      error.value = LOAD_ERROR
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    readings.value = []
    error.value = ''
    loading.value = false
  }

  return { readings, loading, error, count, average, max, min, setData, load, reset }
})
