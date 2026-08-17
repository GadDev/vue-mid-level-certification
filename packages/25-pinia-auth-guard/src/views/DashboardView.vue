<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function onLogout(): Promise<void> {
  // TODO: sign out and leave the protected page — staying here would show a
  // dashboard the guard would now refuse.
  void router
  auth.logout()
}
</script>

<template>
  <section data-testid="dashboard">
    <p data-testid="who">{{ auth.user?.email }}</p>
    <button type="button" data-testid="logout" @click="onLogout">Sign out</button>
  </section>
</template>
