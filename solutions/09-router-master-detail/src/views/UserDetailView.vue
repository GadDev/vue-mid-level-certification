<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { findUser } from '../data/users'

const route = useRoute()

// Navigating from /users/1 to /users/2 reuses this component instance — setup()
// does NOT run again. Reading route.params once into a plain const would show
// stale data forever; a computed (or a watcher) is what keeps it in sync.
const user = computed(() => {
  const raw = route.params.id
  return findUser(Number(Array.isArray(raw) ? raw[0] : raw))
})
</script>
<template>
  <section v-if="user">
    <h2 data-testid="detail-name">{{ user.name }}</h2>
    <p data-testid="detail-role">{{ user.role }}</p>
    <p data-testid="detail-bio">{{ user.bio }}</p>
  </section>
  <RouterLink :to="{ name: 'users' }" data-testid="back">Back to users</RouterLink>
</template>
