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
    // TODO: a second call while one is in flight must not fire a second request,
    // and neither must a call once everything is loaded.
    const next = page.value + 1
    const batch = await loadPage(next)
    items.value = [...items.value, ...batch]
    page.value = next
    void pageSize
    void error
    void done
    void loading
  }

  function reset(): void {
    // TODO: back to the empty state, ready to load page 1 again.
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
