<script setup lang="ts">
import { useUserSearch } from '../composables/useUserSearch'

const { query, results, loading, error } = useUserSearch(300)
</script>
<template>
  <input v-model="query" data-testid="search" placeholder="Search users" />
  <p v-if="loading" data-testid="loading">Searching…</p>
  <p v-else-if="error" data-testid="error" role="alert">{{ error }}</p>
  <template v-else>
    <p data-testid="count">{{ results.length }}</p>
    <ul>
      <li v-for="user in results" :key="user.id" data-testid="user">
        {{ user.name }} — {{ user.role }}
      </li>
    </ul>
    <p v-if="query.trim() && !results.length" data-testid="empty">No users found.</p>
  </template>
</template>
