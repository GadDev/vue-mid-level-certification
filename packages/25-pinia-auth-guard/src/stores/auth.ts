import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginRequest, type User } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => false)

  async function login(email: string, password: string): Promise<boolean> {
    // TODO: flag `loading` while the request runs, store the user on success,
    // and expose the API's message on failure without leaving a stale user
    // behind. Resolve to whether the login worked.
    void loginRequest
    void error
    void loading
    return false
  }

  function logout(): void {
    // TODO
  }

  return { user, loading, error, isAuthenticated, isAdmin, login, logout }
})
