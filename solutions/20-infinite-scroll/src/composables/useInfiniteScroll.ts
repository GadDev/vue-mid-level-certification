import { type ComputedRef, computed, type Ref, ref } from 'vue'

export const LOAD_ERROR = 'Could not load more posts.'

export interface InfiniteList<T> {
  items: ComputedRef<T[]>
  loading: ComputedRef<boolean>
  /** True once a short or empty page proves there is nothing left. */
  done: ComputedRef<boolean>
  error: ComputedRef<string>
  page: ComputedRef<number>
  loadMore: () => Promise<void>
  reset: () => void
}

/**
 * `loadPage` is injected so the composable can be tested — and reused — without
 * knowing where the data comes from.
 */
export function useInfiniteScroll<T>(
  loadPage: (page: number) => Promise<T[]>,
  pageSize = 20
): InfiniteList<T> {
  const items = ref([]) as Ref<T[]>
  const loading = ref(false)
  const done = ref(false)
  const error = ref('')
  const page = ref(0)

  async function loadMore(): Promise<void> {
    // The guard is the whole exercise: a scroll handler fires dozens of times,
    // and every extra call here is a duplicate request.
    if (loading.value || done.value) return

    loading.value = true
    const next = page.value + 1
    try {
      const batch = await loadPage(next)
      items.value = [...items.value, ...batch]
      // Only advance on success, so a retry asks for the same page again.
      page.value = next
      error.value = ''
      // A page shorter than requested is the end of the data.
      if (batch.length < pageSize) done.value = true
    } catch {
      error.value = LOAD_ERROR
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    items.value = []
    page.value = 0
    done.value = false
    error.value = ''
    loading.value = false
  }

  return {
    items: computed(() => items.value),
    loading: computed(() => loading.value),
    done: computed(() => done.value),
    error: computed(() => error.value),
    page: computed(() => page.value),
    loadMore,
    reset,
  }
}
