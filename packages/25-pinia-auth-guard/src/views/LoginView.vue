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
  // TODO: sign in, then go where the user was originally headed
  // (`query.redirect`) — or to the dashboard when there was nowhere.
  void route
  void router
  await auth.login(email.value, password.value)
}
</script>

<template>
  <form data-testid="login" @submit.prevent="onSubmit">
    <input v-model="email" data-testid="email" type="email" />
    <input v-model="password" data-testid="password" type="password" />
    <button type="submit" data-testid="submit">Sign in</button>
    <!-- TODO: only while there is an error -->
    <p role="alert" data-testid="error">{{ auth.error }}</p>
  </form>
</template>
