import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { type Product, products } from '../data/products'

export const STORAGE_KEY = 'wishlist'

function storage(): Storage | null {
  // Missing under SSR, and throwing in some privacy modes.
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** Reads the persisted ids, surviving a missing, disabled or corrupt store. */
export function readStoredIds(): number[] {
  const raw = storage()?.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is number => typeof id === 'number')
  } catch {
    // A corrupt entry is a bad cache, not a fatal error.
    return []
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const ids = ref<number[]>(readStoredIds())

  const count = computed(() => ids.value.length)

  // Insertion order, not catalogue order: the list reads as a history.
  const items = computed<Product[]>(() =>
    ids.value
      .map(id => products.find(product => product.id === id))
      .filter((product): product is Product => product !== undefined)
  )

  // A getter that returns a function — the caller passes the id in.
  const isFavorite = computed(() => (id: number) => ids.value.includes(id))

  function remove(id: number): void {
    ids.value = ids.value.filter(current => current !== id)
  }

  function toggle(id: number): void {
    if (!products.some(product => product.id === id)) return
    if (ids.value.includes(id)) remove(id)
    else ids.value.push(id)
  }

  function clear(): void {
    ids.value = []
  }

  watch(
    ids,
    value => {
      try {
        storage()?.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // A full or read-only quota must not break the wishlist itself.
      }
    },
    { deep: true }
  )

  return { ids, count, items, isFavorite, toggle, remove, clear }
})
