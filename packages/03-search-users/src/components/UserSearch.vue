<script setup lang="ts">
import { ref } from 'vue'

interface User {
  id: number
  name: string
  role: string
}

const users: User[] = [
  { id: 1, name: 'Alice Johnson', role: 'Designer' },
  { id: 2, name: 'Bob Smith', role: 'Developer' },
  { id: 3, name: 'Charlie Brown', role: 'Product Manager' },
  { id: 4, name: 'Marie Dupont', role: 'Developer' },
  { id: 5, name: 'John Walker', role: 'QA Engineer' },
]

const search = ref('')

// TODO: a `filteredUsers` computed — trimmed, case-insensitive, name match
</script>
<template>
  <input v-model="search" data-testid="search" placeholder="Search users" />
  <!-- TODO: result count, the list itself and an empty state -->
  <ul>
    <li v-for="user in users" :key="user.id" data-testid="user">
      {{ user.name }} — {{ user.role }}
    </li>
  </ul>
</template>
