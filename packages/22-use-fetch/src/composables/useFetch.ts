import { type ComputedRef, computed, type Ref, ref } from 'vue'

export const FETCH_ERROR = 'Request failed.'

export interface Fetcher<T> {
  data: ComputedRef<T | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<string>
  /** The key of the last request, cached or not. */
  key: ComputedRef<string | null>
  load: (key: string) => Promise<void>
  /** Re-runs the last key, ignoring anything cached for it. */
  retry: () => Promise<void>
  /** Drops one cache entry, or the whole cache when called with no key. */
  invalidate: (key?: string) => void
}

/**
 * `load` is injected: the composable owns caching and state, not the transport.
 */
export function useFetch<T>(load: (key: string) => Promise<T>): Fetcher<T> {
  const data = ref(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref('')
  const key = ref<string | null>(null)
  const cache = new Map<string, T>()
  // biome-ignore lint/style/useConst: your implementation increments this per request
  let ticket = 0

  async function run(next: string, useCache = true): Promise<void> {
    // TODO: serve from the cache without touching `load` at all, otherwise
    // request it — and let only the newest request write to `data`.
    void useCache
    void cache
    void ticket
    key.value = next
    data.value = await load(next)
    void loading
    void error
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    key: computed(() => key.value),
    load: (next: string) => run(next),
    // TODO: retry must bypass the cache — and do nothing when nothing was loaded yet
    retry: async () => {},
    invalidate: () => {},
  }
}
