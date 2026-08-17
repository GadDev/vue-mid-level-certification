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
  // Per-instance, not module-level: two fetchers must not share a cache.
  const cache = new Map<string, T>()
  let ticket = 0

  async function run(next: string, useCache = true): Promise<void> {
    key.value = next
    const current = ++ticket

    if (useCache && cache.has(next)) {
      // A cache hit is synchronous — no loading flicker for data we already have.
      data.value = cache.get(next) as T
      error.value = ''
      loading.value = false
      return
    }

    loading.value = true
    data.value = null
    try {
      const result = await load(next)
      // A response that lost the race must not overwrite the newer one.
      if (current !== ticket) return
      cache.set(next, result)
      data.value = result
      error.value = ''
    } catch {
      if (current !== ticket) return
      // Failures are not cached, so the next attempt really retries.
      error.value = FETCH_ERROR
      data.value = null
    } finally {
      if (current === ticket) loading.value = false
    }
  }

  function invalidate(target?: string): void {
    if (target === undefined) cache.clear()
    else cache.delete(target)
  }

  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    key: computed(() => key.value),
    load: (next: string) => run(next),
    retry: async () => {
      if (key.value === null) return
      await run(key.value, false)
    },
    invalidate,
  }
}
