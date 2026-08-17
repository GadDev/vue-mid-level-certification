import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '../src/App.vue'
import { createAppRouter } from '../src/router'
import { useAuthStore } from '../src/stores/auth'

let pinia: ReturnType<typeof createPinia>

function build() {
  const router = createAppRouter(createMemoryHistory())
  return { router }
}

async function render(path: string) {
  const { router } = build()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

describe('route guards', () => {
  it('sends an anonymous visitor from a protected route to the login page', async () => {
    const { router } = build()
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('remembers where the visitor was headed', async () => {
    const { router } = build()
    await router.push('/admin')
    expect(router.currentRoute.value.query.redirect).toBe('/admin')
  })

  it('lets a signed-in member reach the dashboard', async () => {
    await useAuthStore().login('member@example.com', 'secret')
    const { wrapper, router } = await render('/dashboard')

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(wrapper.get('[data-testid="who"]').text()).toBe('member@example.com')
  })

  it('keeps a member out of the admin area', async () => {
    await useAuthStore().login('member@example.com', 'secret')
    const { router } = build()
    await router.push('/admin')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('lets an admin in', async () => {
    await useAuthStore().login('admin@example.com', 'secret')
    const { wrapper, router } = await render('/admin')
    expect(router.currentRoute.value.name).toBe('admin')
    expect(wrapper.find('[data-testid="admin"]').exists()).toBe(true)
  })

  it('keeps a signed-in user away from the login page', async () => {
    await useAuthStore().login('member@example.com', 'secret')
    const { router } = build()
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('redirects the root to the dashboard', async () => {
    await useAuthStore().login('member@example.com', 'secret')
    const { router } = build()
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('signs in through the form and lands on the dashboard', async () => {
    const { wrapper, router } = await render('/login')

    await wrapper.get('[data-testid="email"]').setValue('member@example.com')
    await wrapper.get('[data-testid="password"]').setValue('secret')
    await wrapper.get('[data-testid="login"]').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(wrapper.find('[data-testid="dashboard"]').exists()).toBe(true)
  })

  it('returns the user to the page they wanted', async () => {
    const { wrapper, router } = await render('/admin')
    expect(router.currentRoute.value.name).toBe('login')

    await wrapper.get('[data-testid="email"]').setValue('admin@example.com')
    await wrapper.get('[data-testid="password"]').setValue('secret')
    await wrapper.get('[data-testid="login"]').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/admin')
  })

  it('shows the error and stays put after a bad password', async () => {
    const { wrapper, router } = await render('/login')

    await wrapper.get('[data-testid="email"]').setValue('member@example.com')
    await wrapper.get('[data-testid="password"]').setValue('wrong')
    await wrapper.get('[data-testid="login"]').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('login')
    expect(wrapper.get('[data-testid="error"]').text()).not.toBe('')
  })

  it('shows no error before an attempt', async () => {
    const { wrapper } = await render('/login')
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(false)
  })

  it('kicks the user out of a protected page on sign-out', async () => {
    await useAuthStore().login('member@example.com', 'secret')
    const { wrapper, router } = await render('/dashboard')

    await wrapper.get('[data-testid="logout"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('login')

    // And the guard keeps them out from there on.
    await router.push('/dashboard')
    expect(router.currentRoute.value.name).toBe('login')
  })
})
