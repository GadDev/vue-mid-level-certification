import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '../src/App.vue'
import { createAppRouter } from '../src/router'

async function render(path: string) {
  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

function labels(wrapper: VueWrapper): string[] {
  return wrapper.findAll('[data-testid="crumb"]').map(crumb => crumb.text())
}

function links(wrapper: VueWrapper): Array<string | undefined> {
  return wrapper.findAll('[data-testid="crumb"] a').map(link => link.attributes('href'))
}

function current(wrapper: VueWrapper): string[] {
  return wrapper
    .findAll('[data-testid="crumb"]')
    .filter(crumb => crumb.find('[aria-current="page"]').exists())
    .map(crumb => crumb.text())
}

describe('Breadcrumbs', () => {
  it('shows a single, unlinked crumb on the home page', async () => {
    const { wrapper } = await render('/')
    expect(labels(wrapper)).toEqual(['Home'])
    expect(links(wrapper)).toEqual([])
    expect(current(wrapper)).toEqual(['Home'])
  })

  it('builds the trail from the matched routes', async () => {
    const { wrapper } = await render('/products')
    expect(labels(wrapper)).toEqual(['Home', 'Products'])
    expect(links(wrapper)).toEqual(['/'])
    expect(current(wrapper)).toEqual(['Products'])
  })

  it('resolves a label that depends on the params', async () => {
    const { wrapper } = await render('/products/tools')
    expect(labels(wrapper)).toEqual(['Home', 'Products', 'Tools'])
    expect(links(wrapper)).toEqual(['/', '/products'])
  })

  it('fills the params into the intermediate links', async () => {
    const { wrapper } = await render('/products/tools/7')
    expect(labels(wrapper)).toEqual(['Home', 'Products', 'Tools', 'Item #7'])
    expect(links(wrapper)).toEqual(['/', '/products', '/products/tools'])
    expect(current(wrapper)).toEqual(['Item #7'])
  })

  it('skips routes that declare no breadcrumb', async () => {
    const { wrapper } = await render('/settings')
    expect(labels(wrapper)).toEqual(['Home'])
    expect(current(wrapper)).toEqual(['Home'])
  })

  it('never repeats a crumb for a pathless child route', async () => {
    const { wrapper } = await render('/products')
    expect(labels(wrapper)).toEqual(['Home', 'Products'])
  })

  it('follows navigation', async () => {
    const { wrapper, router } = await render('/products/tools/7')

    await router.push('/products/audio')
    await flushPromises()
    expect(labels(wrapper)).toEqual(['Home', 'Products', 'Audio'])
    expect(current(wrapper)).toEqual(['Audio'])

    await router.push('/')
    await flushPromises()
    expect(labels(wrapper)).toEqual(['Home'])
  })

  it('updates when only a param changes', async () => {
    const { wrapper, router } = await render('/products/tools/7')
    await router.push('/products/tools/9')
    await flushPromises()
    expect(labels(wrapper)).toEqual(['Home', 'Products', 'Tools', 'Item #9'])
  })

  it('marks exactly one crumb as the current page', async () => {
    const { wrapper } = await render('/products/tools/7')
    expect(current(wrapper)).toHaveLength(1)
    expect(links(wrapper)).toHaveLength(3)
  })

  it('renders the breadcrumb navigation as a labelled landmark', async () => {
    const { wrapper } = await render('/products')
    const nav = wrapper.get('[data-testid="breadcrumbs"]')
    expect(nav.attributes('aria-label')).toBe('Breadcrumb')
  })
})
