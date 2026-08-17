import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { STORAGE_KEY, useWishlistStore } from '../src/stores/wishlist'

function stored(): unknown {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw === null ? null : JSON.parse(raw)
}

beforeEach(() => {
  window.localStorage.clear()
  setActivePinia(createPinia())
})

describe('wishlist store', () => {
  it('starts empty', () => {
    const wishlist = useWishlistStore()
    expect(wishlist.ids).toEqual([])
    expect(wishlist.count).toBe(0)
    expect(wishlist.items).toEqual([])
    expect(wishlist.isFavorite(1)).toBe(false)
  })

  it('toggles a product on', () => {
    const wishlist = useWishlistStore()
    wishlist.toggle(2)
    expect(wishlist.ids).toEqual([2])
    expect(wishlist.count).toBe(1)
    expect(wishlist.isFavorite(2)).toBe(true)
  })

  it('toggles the same product off', () => {
    const wishlist = useWishlistStore()
    wishlist.toggle(2)
    wishlist.toggle(2)
    expect(wishlist.ids).toEqual([])
    expect(wishlist.isFavorite(2)).toBe(false)
  })

  it('ignores a product that does not exist', () => {
    const wishlist = useWishlistStore()
    wishlist.toggle(999)
    expect(wishlist.ids).toEqual([])
  })

  it('exposes the full products in the order they were added', () => {
    const wishlist = useWishlistStore()
    wishlist.toggle(3)
    wishlist.toggle(1)
    expect(wishlist.items.map(product => product.name)).toEqual(['Mouse', 'Keyboard'])
    expect(wishlist.items[0].price).toBe(39)
  })

  it('removes and clears', () => {
    const wishlist = useWishlistStore()
    wishlist.toggle(1)
    wishlist.toggle(2)

    wishlist.remove(1)
    expect(wishlist.ids).toEqual([2])
    expect(() => wishlist.remove(999)).not.toThrow()

    wishlist.clear()
    expect(wishlist.ids).toEqual([])
  })

  it('persists every change', async () => {
    const wishlist = useWishlistStore()
    wishlist.toggle(1)
    await nextTick()
    expect(stored()).toEqual([1])

    wishlist.toggle(4)
    await nextTick()
    expect(stored()).toEqual([1, 4])

    wishlist.clear()
    await nextTick()
    expect(stored()).toEqual([])
  })

  it('hydrates from storage', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([2, 3]))
    const wishlist = useWishlistStore()
    expect(wishlist.ids).toEqual([2, 3])
    expect(wishlist.isFavorite(3)).toBe(true)
  })

  it('survives corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json')
    expect(useWishlistStore().ids).toEqual([])
  })

  it('ignores a stored value that is not an array', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: [1] }))
    expect(useWishlistStore().ids).toEqual([])
  })

  it('drops entries that are not numbers', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 'two', null, 3]))
    expect(useWishlistStore().ids).toEqual([1, 3])
  })

  it('keeps working when storage refuses to write', async () => {
    const setItem = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const wishlist = useWishlistStore()
    expect(() => wishlist.toggle(1)).not.toThrow()
    await nextTick()
    expect(wishlist.ids).toEqual([1])

    setItem.mockRestore()
  })

  it('is a singleton per pinia instance', () => {
    const first = useWishlistStore()
    first.toggle(1)
    expect(useWishlistStore().ids).toEqual([1])

    setActivePinia(createPinia())
    window.localStorage.clear()
    expect(useWishlistStore().ids).toEqual([])
  })
})
