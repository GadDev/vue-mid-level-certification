<script setup lang="ts">
import { ref } from 'vue'

interface Item {
  id: number
  label: string
}

const items: Item[] = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, label: `Item ${i + 1}` }))

const index = ref('')
const error = ref('')
const highlightedId = ref<number | null>(null)

// TODO: collect one template ref per row (no document.querySelector!),
// validate the submitted index, scroll the matching row into view
// and highlight it for about 1 second.
function go(): void {
  // TODO: implement
}
</script>
<template>
  <div class="list">
    <div v-for="item in items" :key="item.id" class="item">{{ item.label }}</div>
  </div>
  <form @submit.prevent="go">
    <input v-model="index" data-testid="index" inputmode="numeric" />
    <button data-testid="go">Go</button>
    <p v-if="error" role="alert">{{ error }}</p>
  </form>
</template>
<style scoped>
.list {
  height: 240px;
  overflow: auto;
  border: 1px solid #aaa;
}
.item {
  padding: 14px;
}
.item:nth-child(even) {
  background: #f5f5f5;
}
.highlighted {
  outline: 3px solid rebeccapurple;
}
form {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
