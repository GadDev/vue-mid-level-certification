import { type ComputedRef, computed, ref } from 'vue'

export interface CounterHistory {
  /** Read-only on purpose: callers change the count through the actions. */
  count: ComputedRef<number>
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  increment: () => void
  decrement: () => void
  reset: () => void
  undo: () => void
  redo: () => void
}

export function useCounterHistory(initial = 0): CounterHistory {
  const count = ref(initial)
  const past = ref<number[]>([])
  const future = ref<number[]>([])

  // TODO: record every count-changing action, clear the redo history when a new
  // change happens after an undo, and expose canUndo / canRedo.
  return {
    count: computed(() => count.value),
    canUndo: computed(() => past.value.length > 0),
    canRedo: computed(() => future.value.length > 0),
    increment: () => {},
    decrement: () => {},
    reset: () => {},
    undo: () => {},
    redo: () => {},
  }
}
