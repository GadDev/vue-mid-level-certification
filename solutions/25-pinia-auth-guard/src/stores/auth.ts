import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginRequest, type User } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    try {
      user.value = await loginRequest(email, password)
      error.value = ''
      return true
    } catch (cause) {
      // A failed login is a signed-out state — never leave the old session up.
      user.value = null
      error.value = cause instanceof Error ? cause.message : 'Login failed.'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    user.value = null
    error.value = ''
  }

  return { user, loading, error, isAuthenticated, isAdmin, login, logout }
})
