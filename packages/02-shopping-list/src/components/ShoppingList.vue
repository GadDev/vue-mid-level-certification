<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  name: string
}

// Keep the items purely domain data: edit state belongs in its own ref.
const items = ref<Item[]>([
  { id: 1, name: 'Coffee' },
  { id: 2, name: 'Apples' },
  { id: 3, name: 'Bread' },
])

const newItem = ref('')
const editingId = ref<number | null>(null)
const draft = ref('')

// TODO: addItem, duplicateItem, removeItem, startEdit, saveEdit, sortItems
function addItem(): void {
  // TODO: implement
}
</script>
<template>
  <form data-testid="add-form" @submit.prevent="addItem">
    <input v-model="newItem" data-testid="new-item" placeholder="Add item" />
    <button>Add</button>
  </form>
  <button data-testid="sort">Sort A–Z</button>
  <ul>
    <li v-for="item in items" :key="item.id">
      <!-- TODO: swap this row for an edit input + Save button while editing -->
      <span data-testid="item-name">{{ item.name }}</span>
      <button data-testid="edit">Edit</button>
      <button data-testid="duplicate">Duplicate</button>
      <button data-testid="delete">Delete</button>
    </li>
  </ul>
</template>
