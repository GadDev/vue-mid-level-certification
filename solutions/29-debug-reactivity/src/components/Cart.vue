<script setup lang="ts">
import { computed, ref } from 'vue'
import { initialLines, type Line } from '../data/cart'

const lines = ref<Line[]>([...initialLines])

// FIX 1: `ref(expression)` evaluates once, at setup. A derived value belongs in
// a computed, which re-runs when `lines` changes.
const total = computed(() => lines.value.reduce((sum, line) => sum + line.price, 0))

// FIX 2: `sort` mutates. Sorting inside a computed reordered the cart itself —
// a side effect from a getter. Copy first.
const cheapestFirst = computed(() => [...lines.value].sort((a, b) => a.price - b.price))

function add(line: Line): void {
  lines.value.push(line)
}

function remove(id: number): void {
  lines.value = lines.value.filter(line => line.id !== id)
}
</script>

<template>
  <div>
    <ul>
      <li v-for="line in lines" :key="line.id" data-testid="line">{{ line.name }}</li>
    </ul>
    <ul>
      <li v-for="line in cheapestFirst" :key="line.id" data-testid="cheap">{{ line.name }}</li>
    </ul>
    <p data-testid="total">{{ total }}</p>
    <button type="button" data-testid="add" @click="add({ id: 4, name: 'Drill', price: 210 })">
      Add drill
    </button>
    <button type="button" data-testid="remove" @click="remove(1)">Remove anvil</button>
  </div>
</template>
