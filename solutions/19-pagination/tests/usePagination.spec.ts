import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { usePagination } from '../src/composables/usePagination'
import { type User, users } from '../src/data/users'

function setup(list: User[] = users, size = 10) {
  const source = ref(list)
  return { source, pagination: usePagination(source, size) }
}

describe('usePagination', () => {
  it('starts on the first page', () => {
    const { pagination } = setup()
    expect(pagination.page.value).toBe(1)
    expect(pagination.pageSize.value).toBe(10)
    expect(pagination.pageCount.value).toBe(10)
    expect(pagination.pageItems.value.map(user => user.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('slices the requested page', () => {
    const { pagination } = setup()
    pagination.goTo(3)
    expect(pagination.pageItems.value[0].id).toBe(21)
    expect(pagination.pageItems.value).toHaveLength(10)
  })

  it('walks forward and back', () => {
    const { pagination } = setup()
    pagination.next()
    pagination.next()
    expect(pagination.page.value).toBe(3)
    pagination.prev()
    expect(pagination.page.value).toBe(2)
  })

  it('clamps at both ends', () => {
    const { pagination } = setup()
    pagination.prev()
    expect(pagination.page.value).toBe(1)

    pagination.goTo(10)
    pagination.next()
    expect(pagination.page.value).toBe(10)
  })

  it('clamps an out-of-range goTo', () => {
    const { pagination } = setup()
    pagination.goTo(99)
    expect(pagination.page.value).toBe(10)
    pagination.goTo(-4)
    expect(pagination.page.value).toBe(1)
  })

  it('ignores a page that is not a whole number', () => {
    const { pagination } = setup()
    pagination.goTo(4)
    pagination.goTo(Number.NaN)
    pagination.goTo(2.5)
    expect(pagination.page.value).toBe(4)
  })

  it('flags the first and last page', () => {
    const { pagination } = setup()
    expect(pagination.isFirst.value).toBe(true)
    expect(pagination.isLast.value).toBe(false)

    pagination.goTo(10)
    expect(pagination.isFirst.value).toBe(false)
    expect(pagination.isLast.value).toBe(true)
  })

  it('leaves a short last page short', () => {
    const { pagination } = setup(users.slice(0, 95))
    expect(pagination.pageCount.value).toBe(10)
    pagination.goTo(10)
    expect(pagination.pageItems.value).toHaveLength(5)
  })

  it('resets to page 1 when the page size changes', () => {
    const { pagination } = setup()
    pagination.goTo(7)
    pagination.setPageSize(25)
    expect(pagination.page.value).toBe(1)
    expect(pagination.pageCount.value).toBe(4)
    expect(pagination.pageItems.value).toHaveLength(25)
  })

  it('ignores a page size that makes no sense', () => {
    const { pagination } = setup()
    pagination.goTo(3)
    pagination.setPageSize(0)
    pagination.setPageSize(-10)
    expect(pagination.pageSize.value).toBe(10)
    expect(pagination.page.value).toBe(3)
  })

  it('follows a shrinking source instead of showing an empty page', () => {
    const { source, pagination } = setup()
    pagination.goTo(10)
    source.value = users.slice(0, 25)
    expect(pagination.pageCount.value).toBe(3)
    expect(pagination.page.value).toBe(3)
    expect(pagination.pageItems.value).toHaveLength(5)
  })

  it('survives an empty source', () => {
    const { pagination } = setup([])
    expect(pagination.pageCount.value).toBe(1)
    expect(pagination.page.value).toBe(1)
    expect(pagination.pageItems.value).toEqual([])
    expect(pagination.isFirst.value).toBe(true)
    expect(pagination.isLast.value).toBe(true)
  })

  it('reacts to a growing source', () => {
    const { source, pagination } = setup(users.slice(0, 10))
    expect(pagination.pageCount.value).toBe(1)
    source.value = users
    expect(pagination.pageCount.value).toBe(10)
  })
})
