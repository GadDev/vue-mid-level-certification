<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function onLogout(): Promise<void> {
  auth.logout()
  // The guard only runs on navigation, so signing out has to move the user.
  await router.push({ name: 'login' })
}
</script>

<template>
  <section data-testid="dashboard">
    <p data-testid="who">{{ auth.user?.email }}</p>
    <button type="button" data-testid="logout" @click="onLogout">Sign out</button>
  </section>
</template>
