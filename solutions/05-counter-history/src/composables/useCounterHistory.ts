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

  function commit(next: number): void {
    // A no-op action (reset at 0) is not a history entry.
    if (next === count.value) return
    past.value.push(count.value)
    count.value = next
    // Branching away from an undone state discards the old future.
    future.value = []
  }

  function undo(): void {
    const previous = past.value.pop()
    if (previous === undefined) return
    future.value.push(count.value)
    count.value = previous
  }

  function redo(): void {
    const next = future.value.pop()
    if (next === undefined) return
    past.value.push(count.value)
    count.value = next
  }

  return {
    count: computed(() => count.value),
    canUndo: computed(() => past.value.length > 0),
    canRedo: computed(() => future.value.length > 0),
    increment: () => commit(count.value + 1),
    decrement: () => commit(count.value - 1),
    reset: () => commit(0),
    undo,
    redo,
  }
}
