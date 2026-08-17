import { type ComputedRef, computed, type Ref, ref } from 'vue'

export interface Pagination<T> {
  page: ComputedRef<number>
  pageSize: ComputedRef<number>
  pageCount: ComputedRef<number>
  pageItems: ComputedRef<T[]>
  isFirst: ComputedRef<boolean>
  isLast: ComputedRef<boolean>
  goTo: (page: number) => void
  next: () => void
  prev: () => void
  setPageSize: (size: number) => void
}

export function usePagination<T>(source: Ref<T[]>, initialSize = 10): Pagination<T> {
  const page = ref(1)
  const pageSize = ref(initialSize)

  const pageCount = computed(() => Math.max(1, Math.ceil(source.value.length / pageSize.value)))

  // The stored page is clamped on read, so a source that shrinks under the user
  // shows the new last page instead of an empty one.
  const current = computed(() => Math.min(page.value, pageCount.value))

  const pageItems = computed(() => {
    const start = (current.value - 1) * pageSize.value
    return source.value.slice(start, start + pageSize.value)
  })

  function goTo(target: number): void {
    if (!Number.isInteger(target)) return
    page.value = Math.min(Math.max(target, 1), pageCount.value)
  }

  function setPageSize(size: number): void {
    if (!Number.isInteger(size) || size < 1) return
    pageSize.value = size
    // The old page number means something different at a new size — start over.
    page.value = 1
  }

  return {
    page: current,
    pageSize: computed(() => pageSize.value),
    pageCount,
    pageItems,
    isFirst: computed(() => current.value === 1),
    isLast: computed(() => current.value === pageCount.value),
    goTo,
    next: () => goTo(current.value + 1),
    prev: () => goTo(current.value - 1),
    setPageSize,
  }
}
