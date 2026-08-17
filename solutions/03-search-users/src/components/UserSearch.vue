<script setup lang="ts">
import { computed, ref } from 'vue'

interface User {
  id: number
  name: string
  role: string
}

// Plain constant: it never changes, so it does not need to be reactive.
const users: User[] = [
  { id: 1, name: 'Alice Johnson', role: 'Designer' },
  { id: 2, name: 'Bob Smith', role: 'Developer' },
  { id: 3, name: 'Charlie Brown', role: 'Product Manager' },
  { id: 4, name: 'Marie Dupont', role: 'Developer' },
  { id: 5, name: 'John Walker', role: 'QA Engineer' },
]

const search = ref('')

// A computed, not a method: it caches until `search` actually changes, so a
// re-render for any other reason does not re-filter the list.
const filteredUsers = computed<User[]>(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return users
  return users.filter(user => user.name.toLowerCase().includes(query))
})
</script>
<template>
  <input v-model="search" data-testid="search" placeholder="Search users" />
  <p data-testid="count">{{ filteredUsers.length }} of {{ users.length }} users</p>
  <ul v-if="filteredUsers.length">
    <li v-for="user in filteredUsers" :key="user.id" data-testid="user">
      {{ user.name }} — {{ user.role }}
    </li>
  </ul>
  <p v-else data-testid="empty">No users match “{{ search.trim() }}”.</p>
</template>
