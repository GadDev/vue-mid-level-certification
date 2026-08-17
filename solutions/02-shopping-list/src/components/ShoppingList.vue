<script setup lang="ts">
import { computed, ref } from 'vue'

interface Item {
  id: number
  name: string
}

// Domain data only: `editing` and the in-progress text are view state and live
// outside the items, so sorting or deleting can never leave them stranded.
const items = ref<Item[]>([
  { id: 1, name: 'Coffee' },
  { id: 2, name: 'Apples' },
  { id: 3, name: 'Bread' },
])

let nextId = 4
function createId(): number {
  return nextId++
}

const newItem = ref('')
const editingId = ref<number | null>(null)
const draft = ref('')

const editingItem = computed(() => items.value.find(item => item.id === editingId.value) ?? null)

function addItem(): void {
  const name = newItem.value.trim()
  if (!name) return
  items.value.push({ id: createId(), name })
  newItem.value = ''
}

function duplicateItem(item: Item): void {
  const at = items.value.findIndex(x => x.id === item.id)
  items.value.splice(at + 1, 0, { id: createId(), name: item.name })
}

function removeItem(item: Item): void {
  if (editingId.value === item.id) cancelEdit()
  items.value = items.value.filter(x => x.id !== item.id)
}

function startEdit(item: Item): void {
  editingId.value = item.id
  draft.value = item.name
}

function saveEdit(): void {
  const item = editingItem.value
  const name = draft.value.trim()
  // A blank edit is rejected: the original name survives.
  if (item && name) item.name = name
  cancelEdit()
}

function cancelEdit(): void {
  editingId.value = null
  draft.value = ''
}

function sortItems(): void {
  // A new array, so the computed/render pass sees a fresh reference; keyed
  // v-for keeps the item being edited in edit mode after the reorder.
  items.value = [...items.value].sort((a, b) => a.name.localeCompare(b.name))
}
</script>
<template>
  <form data-testid="add-form" @submit.prevent="addItem">
    <input v-model="newItem" data-testid="new-item" placeholder="Add item" />
    <button>Add</button>
  </form>
  <button data-testid="sort" @click="sortItems">Sort A–Z</button>
  <ul>
    <li v-for="item in items" :key="item.id">
      <template v-if="editingId === item.id">
        <input v-model="draft" data-testid="edit-input" @keyup.enter="saveEdit" />
        <button data-testid="save" @click="saveEdit">Save</button>
      </template>
      <template v-else>
        <span data-testid="item-name">{{ item.name }}</span>
        <button data-testid="edit" @click="startEdit(item)">Edit</button>
      </template>
      <button data-testid="duplicate" @click="duplicateItem(item)">Duplicate</button>
      <button data-testid="delete" @click="removeItem(item)">Delete</button>
    </li>
  </ul>
</template>
