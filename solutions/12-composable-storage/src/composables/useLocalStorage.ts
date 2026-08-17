import { onScopeDispose, type Ref, ref, watch } from 'vue'

/**
 * A ref backed by localStorage, kept in sync across tabs.
 *
 * Everything that touches the environment is guarded: the composable must not
 * explode during SSR, on a corrupt stored value, or in a browser with storage
 * disabled.
 */
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const isBrowser = typeof window !== 'undefined' && Boolean(window.localStorage)

  function read(): T {
    if (!isBrowser) return initial
    const raw = window.localStorage.getItem(key)
    if (raw === null) return initial
    try {
      return JSON.parse(raw) as T
    } catch {
      // A corrupt entry is not worth crashing the app over.
      return initial
    }
  }

  const value = ref(read()) as Ref<T>

  if (!isBrowser) return value

  // deep: objects and arrays must persist when a nested field changes.
  watch(
    value,
    next => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Storage full or blocked: keep the in-memory state usable.
      }
    },
    { deep: true }
  )

  function onStorage(event: StorageEvent): void {
    if (event.key !== key) return
    value.value = read()
  }

  window.addEventListener('storage', onStorage)
  // onScopeDispose, not onUnmounted: this also works when the composable is used
  // inside a plain effectScope, and it is what makes the listener leak-free.
  onScopeDispose(() => window.removeEventListener('storage', onStorage))

  return value
}
