import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, type Router } from 'vue-router'
import App from '../src/App.vue'
import { createAppRouter } from '../src/router'

async function render(path = '/') {
  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

function rows(wrapper: VueWrapper): string[] {
  return wrapper.findAll('[data-testid="row"]').map(row => row.text())
}

function status(wrapper: VueWrapper): string {
  return wrapper.get('[data-testid="status"]').text()
}

function query(router: Router) {
  return router.currentRoute.value.query
}

async function click(wrapper: VueWrapper, testid: string) {
  await wrapper.get(`[data-testid="${testid}"]`).trigger('click')
  await flushPromises()
}

describe('ProductsView', () => {
  it('starts on page 1 sorted by name, with a clean URL', async () => {
    const { wrapper, router } = await render()
    expect(rows(wrapper)).toEqual(['Anvil', 'Bucket', 'Chisel', 'Drill', 'Easel'])
    expect(status(wrapper)).toBe('Page 1 of 3')
    expect(query(router)).toEqual({})
  })

  it('reads the page out of the URL', async () => {
    const { wrapper } = await render('/?page=3')
    expect(rows(wrapper)).toEqual(['Kettle', 'Ladder'])
    expect(status(wrapper)).toBe('Page 3 of 3')
  })

  it('sorts by price when the URL says so', async () => {
    const { wrapper } = await render('/?sort=price')
    expect(rows(wrapper)).toEqual(['Ink', 'File', 'Bucket', 'Hammer', 'Chisel'])
  })

  it('filters on the search term, case-insensitively', async () => {
    const { wrapper } = await render('/?q=le')
    expect(rows(wrapper)).toEqual(['File', 'Kettle'])
  })

  it('writes the search term into the URL and returns to page 1', async () => {
    const { wrapper, router } = await render('/?page=3')
    await wrapper.get('[data-testid="q"]').setValue('a')
    await flushPromises()

    expect(query(router).q).toBe('a')
    expect(query(router).page).toBeUndefined()
    expect(status(wrapper)).toBe('Page 1 of 2')
  })

  it('writes the sort into the URL and returns to page 1', async () => {
    const { wrapper, router } = await render('/?page=2')
    await wrapper.get('[data-testid="sort"]').setValue('price')
    await flushPromises()

    expect(query(router).sort).toBe('price')
    expect(query(router).page).toBeUndefined()
    expect(rows(wrapper)[0]).toBe('Ink')
  })

  it('pages through the URL', async () => {
    const { wrapper, router } = await render()
    await click(wrapper, 'next')

    expect(query(router).page).toBe('2')
    expect(rows(wrapper)).toEqual(['File', 'Gauge', 'Hammer', 'Ink', 'Jigsaw'])

    await click(wrapper, 'prev')
    expect(query(router).page).toBeUndefined()
    expect(rows(wrapper)[0]).toBe('Anvil')
  })

  it('keeps the other filters when the page changes', async () => {
    const { wrapper, router } = await render('/?q=e&sort=price')
    await click(wrapper, 'next')
    expect(query(router)).toMatchObject({ q: 'e', sort: 'price', page: '2' })
  })

  it('leaves defaults out of the URL', async () => {
    const { wrapper, router } = await render('/?q=an')
    await wrapper.get('[data-testid="q"]').setValue('')
    await flushPromises()
    expect(query(router)).toEqual({})
  })

  it('falls back to page 1 for a page that is not a number', async () => {
    const { wrapper } = await render('/?page=abc')
    expect(status(wrapper)).toBe('Page 1 of 3')
    expect(rows(wrapper)[0]).toBe('Anvil')
  })

  it('falls back to page 1 for zero and negative pages', async () => {
    expect(status((await render('/?page=0')).wrapper)).toBe('Page 1 of 3')
    expect(status((await render('/?page=-2')).wrapper)).toBe('Page 1 of 3')
  })

  it('clamps a page past the end', async () => {
    const { wrapper } = await render('/?page=99')
    expect(status(wrapper)).toBe('Page 3 of 3')
    expect(rows(wrapper)).toEqual(['Kettle', 'Ladder'])
  })

  it('ignores an unknown sort', async () => {
    const { wrapper } = await render('/?sort=colour')
    expect(rows(wrapper)[0]).toBe('Anvil')
  })

  it('takes the first value of a repeated parameter', async () => {
    const { wrapper } = await render('/?q=le&q=zz')
    expect(rows(wrapper)).toEqual(['File', 'Kettle'])
  })

  it('follows a navigation that changes only the query', async () => {
    const { wrapper, router } = await render()
    await router.push({ query: { sort: 'price', page: '2' } })
    await flushPromises()

    expect(rows(wrapper)[0]).toBe('Kettle')
    expect(status(wrapper)).toBe('Page 2 of 3')
  })

  it('shows the empty state when nothing matches', async () => {
    const { wrapper } = await render('/?q=zzz')
    expect(rows(wrapper)).toEqual([])
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true)
    expect(status(wrapper)).toBe('Page 1 of 1')
  })
})
