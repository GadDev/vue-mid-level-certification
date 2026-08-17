import { onScopeDispose, type ShallowRef, shallowRef } from 'vue'

export interface WindowSize {
  width: ShallowRef<number>
  height: ShallowRef<number>
}

/**
 * shallowRef, not ref: these hold plain numbers that are always replaced, never
 * mutated, so deep reactivity would only cost work.
 */
export function useWindowSize(): WindowSize {
  const width = shallowRef(typeof window === 'undefined' ? 0 : window.innerWidth)
  const height = shallowRef(typeof window === 'undefined' ? 0 : window.innerHeight)

  if (typeof window === 'undefined') return { width, height }

  function update(): void {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  window.addEventListener('resize', update)
  onScopeDispose(() => window.removeEventListener('resize', update))

  return { width, height }
}
