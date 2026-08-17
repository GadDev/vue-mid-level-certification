import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchMetrics, type Reading } from '../api/metrics'

export const useStatsStore = defineStore('stats', () => {
  const readings = ref<Reading[]>([])
  const loading = ref(false)
  const error = ref('')

  const count = computed(() => readings.value.length)
  // TODO: rounded to two decimals; 0 when there is nothing
  const average = computed(() => 0)
  // TODO: null when there is nothing
  const max = computed<Reading | null>(() => null)
  const min = computed<Reading | null>(() => null)

  /** Keeps only the entries that really are readings with a finite value. */
  function setData(raw: unknown[]): void {
    // TODO: the API lies — filter before storing.
    void raw
    readings.value = []
  }

  async function load(): Promise<void> {
    // TODO: loading flag, setData on success, `LOAD_ERROR` on failure.
    void fetchMetrics
    void loading
    void error
  }

  function reset(): void {
    // TODO
  }

  return { readings, loading, error, count, average, max, min, setData, load, reset }
})
