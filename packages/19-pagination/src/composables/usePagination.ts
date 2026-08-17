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

  // TODO: at least one page, even with no items.
  const pageCount = computed(() => 1)

  // TODO: clamp the stored page — the source can shrink under it.
  const current = computed(() => page.value)

  return {
    page: current,
    pageSize: computed(() => pageSize.value),
    pageCount,
    // TODO: the slice for the current page
    pageItems: computed<T[]>(() => []),
    isFirst: computed(() => current.value === 1),
    isLast: computed(() => current.value === pageCount.value),
    goTo: () => {},
    next: () => {},
    prev: () => {},
    // TODO: a new page size starts the user back on page 1
    setPageSize: () => {},
  }
}
