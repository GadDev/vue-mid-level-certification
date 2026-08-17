import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { INVALID_CREDENTIALS } from '../src/api/auth'
import { useAuthStore } from '../src/stores/auth'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('auth store', () => {
  it('starts signed out', () => {
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.isAdmin).toBe(false)
    expect(auth.error).toBe('')
    expect(auth.loading).toBe(false)
  })

  it('signs a member in', async () => {
    const auth = useAuthStore()
    await expect(auth.login('member@example.com', 'secret')).resolves.toBe(true)

    expect(auth.user).toEqual({ id: 2, email: 'member@example.com', role: 'member' })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.isAdmin).toBe(false)
    expect(auth.loading).toBe(false)
  })

  it('recognises an admin', async () => {
    const auth = useAuthStore()
    await auth.login('admin@example.com', 'secret')
    expect(auth.isAdmin).toBe(true)
  })

  it('is loading while the request runs', async () => {
    const auth = useAuthStore()
    const pending = auth.login('admin@example.com', 'secret')
    expect(auth.loading).toBe(true)
    await pending
    expect(auth.loading).toBe(false)
  })

  it('reports bad credentials', async () => {
    const auth = useAuthStore()
    await expect(auth.login('member@example.com', 'wrong')).resolves.toBe(false)

    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBe(INVALID_CREDENTIALS)
    expect(auth.loading).toBe(false)
  })

  it('clears the error on the next success', async () => {
    const auth = useAuthStore()
    await auth.login('member@example.com', 'wrong')
    await auth.login('member@example.com', 'secret')
    expect(auth.error).toBe('')
  })

  it('drops the session when a later login fails', async () => {
    const auth = useAuthStore()
    await auth.login('admin@example.com', 'secret')
    await auth.login('admin@example.com', 'nope')

    expect(auth.user).toBeNull()
    expect(auth.isAdmin).toBe(false)
  })

  it('signs out', async () => {
    const auth = useAuthStore()
    await auth.login('admin@example.com', 'secret')

    auth.logout()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBe('')
  })

  it('is a singleton per pinia instance', async () => {
    await useAuthStore().login('member@example.com', 'secret')
    expect(useAuthStore().isAuthenticated).toBe(true)

    setActivePinia(createPinia())
    expect(useAuthStore().isAuthenticated).toBe(false)
  })
})
