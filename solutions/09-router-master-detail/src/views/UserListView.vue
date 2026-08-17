<script setup lang="ts">
import { users } from '../data/users'
</script>
<template>
  <h2>Users</h2>
  <ul>
    <li v-for="user in users" :key="user.id">
      <RouterLink
        :to="{ name: 'user-detail', params: { id: user.id } }"
        data-testid="user-link"
        active-class="active"
      >
        {{ user.name }}
      </RouterLink>
    </li>
  </ul>
</template>
<style scoped>
.active {
  font-weight: bold;
}
</style>
