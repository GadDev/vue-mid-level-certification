<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

interface Item {
  id: number
  label: string
}

const ITEM_COUNT = 20
const HIGHLIGHT_MS = 1000

const items: Item[] = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: i + 1,
  label: `Item ${i + 1}`,
}))

const index = ref('')
const error = ref('')
const highlightedId = ref<number | null>(null)

// One template ref per row. A function ref keeps the array in sync with v-for
// without ever reaching for document.querySelector.
const rows = ref<HTMLElement[]>([])
function setRow(el: unknown, i: number): void {
  if (el instanceof HTMLElement) rows.value[i] = el
}

let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

function parseIndex(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  // Number('') is 0 and Number(' 3 ') is 3 — trim first, reject empty, then
  // require a whole number inside the rendered range.
  const n = Number(trimmed)
  if (!Number.isInteger(n) || n < 1 || n > ITEM_COUNT) return null
  return n
}

async function go(): Promise<void> {
  const n = parseIndex(index.value)
  if (n === null) {
    error.value = `Enter a whole number between 1 and ${ITEM_COUNT}.`
    highlightedId.value = null
    clearTimeout(timer)
    return
  }

  error.value = ''
  highlightedId.value = n
  // The class binding needs to flush before we scroll, and a repeated
  // submission must restart the timer rather than stack a second one.
  await nextTick()
  rows.value[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  clearTimeout(timer)
  timer = setTimeout(() => {
    highlightedId.value = null
  }, HIGHLIGHT_MS)
}
</script>
<template>
  <div class="list">
    <div
      v-for="(item, i) in items"
      :key="item.id"
      :ref="el => setRow(el, i)"
      class="item"
      :class="{ highlighted: highlightedId === item.id }"
    >
      {{ item.label }}
    </div>
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
