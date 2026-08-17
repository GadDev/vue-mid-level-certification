import { onWatcherCleanup, type Ref, ref, watch } from 'vue'
import { searchUsers, type User } from '../api/users'

export interface UserSearch {
  query: Ref<string>
  results: Ref<User[]>
  loading: Ref<boolean>
  error: Ref<string>
}

export const SEARCH_ERROR = 'Search failed. Please try again.'

export function useUserSearch(delay = 300): UserSearch {
  const query = ref('')
  const results = ref<User[]>([])
  const loading = ref(false)
  const error = ref('')

  // Every request gets a ticket. Only the newest ticket may write to the state,
  // which is what kills the classic stale-response race: an old request that
  // resolves late must not overwrite newer results.
  let ticket = 0

  watch(query, raw => {
    const q = raw.trim()
    const id = ++ticket

    if (!q) {
      results.value = []
      error.value = ''
      loading.value = false
      return
    }

    loading.value = true
    error.value = ''

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsers(q, controller.signal)
        if (id !== ticket) return
        results.value = users
      } catch {
        if (id !== ticket || controller.signal.aborted) return
        results.value = []
        error.value = SEARCH_ERROR
      } finally {
        if (id === ticket) loading.value = false
      }
    }, delay)

    // Runs before the next invocation and when the owning scope is disposed:
    // that is the debounce (clearTimeout) and the abort in one place.
    onWatcherCleanup(() => {
      clearTimeout(timer)
      controller.abort()
    })
  })

  return { query, results, loading, error }
}
