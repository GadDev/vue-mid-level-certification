<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')

async function onSubmit(): Promise<void> {
  if (!(await auth.login(email.value, password.value))) return

  // `redirect` can be a string or an array — normalise before navigating.
  const redirect = route.query.redirect
  const target = Array.isArray(redirect) ? redirect[0] : redirect
  await router.push(target ?? { name: 'dashboard' })
}
</script>

<template>
  <form data-testid="login" @submit.prevent="onSubmit">
    <input v-model="email" data-testid="email" type="email" />
    <input v-model="password" data-testid="password" type="password" />
    <button type="submit" data-testid="submit">Sign in</button>
    <p v-if="auth.error" role="alert" data-testid="error">{{ auth.error }}</p>
  </form>
</template>
