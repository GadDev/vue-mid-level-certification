import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { type Product, products } from '../data/products'

export const STORAGE_KEY = 'wishlist'

/** Reads the persisted ids, surviving a missing, disabled or corrupt store. */
export function readStoredIds(): number[] {
  // TODO: guard `window.localStorage` itself (SSR / privacy mode), then parse.
  // Anything that is not an array of numbers is not worth crashing over.
  return []
}

export const useWishlistStore = defineStore('wishlist', () => {
  const ids = ref<number[]>(readStoredIds())

  const count = computed(() => ids.value.length)
  const items = computed<Product[]>(() => [])
  // A getter that returns a function — the caller passes the id in.
  const isFavorite = computed(() => (id: number) => false)

  function toggle(id: number): void {
    // TODO: add when missing, remove when present. Ignore ids no product has.
  }

  function remove(id: number): void {
    // TODO
  }

  function clear(): void {
    // TODO
  }

  // TODO: persist on every change — nested or not — and keep going if the
  // browser refuses to write.

  return { ids, count, items, isFavorite, toggle, remove, clear }
})
