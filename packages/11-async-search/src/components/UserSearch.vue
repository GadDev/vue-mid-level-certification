<script setup lang="ts">
import { useUserSearch } from '../composables/useUserSearch'

const { query, results, loading, error } = useUserSearch(300)
</script>
<template>
  <input v-model="query" data-testid="search" placeholder="Search users" />
  <!-- TODO: loading indicator, error message (role="alert"), result count,
       the list itself and an empty state — exactly one of them at a time -->
</template>
