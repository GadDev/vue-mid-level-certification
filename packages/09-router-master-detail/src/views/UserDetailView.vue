<script setup lang="ts">
import { useRoute } from 'vue-router'
import { findUser } from '../data/users'

const route = useRoute()

// TODO: this reads the param exactly once. Navigating from /users/1 to /users/2
// reuses this component instance, so setup() never runs again. Make it reactive.
const user = findUser(Number(route.params.id))
</script>
<template>
  <section v-if="user">
    <h2 data-testid="detail-name">{{ user.name }}</h2>
    <p data-testid="detail-role">{{ user.role }}</p>
    <p data-testid="detail-bio">{{ user.bio }}</p>
  </section>
  <RouterLink :to="{ name: 'users' }" data-testid="back">Back to users</RouterLink>
</template>
