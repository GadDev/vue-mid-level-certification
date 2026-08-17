import { type Ref, ref } from 'vue'
import type { User } from '../api/users'

export interface UserSearch {
  query: Ref<string>
  results: Ref<User[]>
  loading: Ref<boolean>
  error: Ref<string>
}

export const SEARCH_ERROR = 'Search failed. Please try again.'

export function useUserSearch(_delay = 300): UserSearch {
  const query = ref('')
  const results = ref<User[]>([])
  const loading = ref(false)
  const error = ref('')

  // TODO: watch `query` and
  //  - trim it; an empty query clears results/error and issues no request
  //  - debounce by `delay` ms, so fast typing produces exactly one request
  //  - pass an AbortSignal to searchUsers and abort the in-flight request when
  //    the query changes again (onWatcherCleanup is the natural place)
  //  - ignore a stale response that resolves after a newer one
  //  - drive `loading`, and set `error` to SEARCH_ERROR when the request fails

  return { query, results, loading, error }
}
