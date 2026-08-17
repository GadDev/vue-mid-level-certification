import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, type Router } from 'vue-router'
import App from '../src/App.vue'
import { createAppRouter, routes } from '../src/router'

let router: Router

async function renderAt(path: string) {
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  router = createAppRouter(createMemoryHistory())
})

describe('routing', () => {
  it('redirects / to the users list', async () => {
    const wrapper = await renderAt('/')
    expect(router.currentRoute.value.name).toBe('users')
    expect(wrapper.findAll('[data-testid="user-link"]')).toHaveLength(4)
  })

  it('links every user to its detail route', async () => {
    const wrapper = await renderAt('/users')
    const links = wrapper.findAll('[data-testid="user-link"]')
    expect(links[0].attributes('href')).toBe('/users/1')
    expect(links[0].text()).toContain('Alice Johnson')
  })

  it('lazy-loads the detail route', () => {
    const detail = routes.find(route => route.name === 'user-detail')
    // A lazy route holds a function, not an already-imported component object.
    expect(typeof detail?.component).toBe('function')
  })

  it('renders the detail view for a valid id', async () => {
    const wrapper = await renderAt('/users/2')
    expect(wrapper.get('[data-testid="detail-name"]').text()).toBe('Bob Smith')
    expect(wrapper.get('[data-testid="detail-role"]').text()).toBe('Developer')
    expect(wrapper.get('[data-testid="detail-bio"]').text()).not.toBe('')
  })

  it('navigates from the list to a detail view', async () => {
    const wrapper = await renderAt('/users')
    await wrapper.findAll('[data-testid="user-link"]')[2].trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.params.id).toBe('3')
    expect(wrapper.get('[data-testid="detail-name"]').text()).toBe('Marie Dupont')
  })

  it('updates the detail view when only the route param changes', async () => {
    const wrapper = await renderAt('/users/1')
    expect(wrapper.get('[data-testid="detail-name"]').text()).toBe('Alice Johnson')

    // Same route record: Vue Router reuses the component instance, so setup()
    // does not run again. Stale data here means the param is not reactive.
    await router.push('/users/4')
    await flushPromises()
    expect(wrapper.get('[data-testid="detail-name"]').text()).toBe('John Walker')
    expect(wrapper.get('[data-testid="detail-role"]').text()).toBe('QA Engineer')
  })

  it.each(['/users/999', '/users/abc', '/users/1.5'])(
    'guards %s back to the users list',
    async path => {
      const wrapper = await renderAt(path)
      expect(router.currentRoute.value.name).toBe('users')
      expect(wrapper.find('[data-testid="detail-name"]').exists()).toBe(false)
      expect(wrapper.findAll('[data-testid="user-link"]')).toHaveLength(4)
    }
  )

  it('renders a not-found view for an unknown path', async () => {
    const wrapper = await renderAt('/nope/nowhere')
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(wrapper.get('[data-testid="not-found"]').text()).not.toBe('')
  })

  it('goes back to the list from a detail view', async () => {
    const wrapper = await renderAt('/users/2')
    await wrapper.get('[data-testid="back"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('users')
    expect(wrapper.findAll('[data-testid="user-link"]')).toHaveLength(4)
  })
})
