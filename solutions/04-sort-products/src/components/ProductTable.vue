<script setup lang="ts">
import { computed, ref } from 'vue'
import { type Product, products } from '../data/products'

type SortKey = 'name' | 'price' | 'rating'
type Direction = 'asc' | 'desc'

const sortBy = ref<SortKey>('name')
const direction = ref<Direction>('asc')

// Depends on three reactive sources (the data plus both controls) and caches
// until one of them changes. `[...products.value]` is what keeps the source
// array untouched — Array.prototype.sort mutates in place.
const sortedProducts = computed<Product[]>(() => {
  const key = sortBy.value
  const factor = direction.value === 'asc' ? 1 : -1

  return [...products.value].sort((a, b) => {
    const left = a[key]
    const right = b[key]
    const result =
      typeof left === 'string' && typeof right === 'string'
        ? left.localeCompare(right)
        : Number(left) - Number(right)
    // Ties fall back to id so the order stays deterministic in both directions.
    return result === 0 ? a.id - b.id : result * factor
  })
})

function toggleDirection(): void {
  direction.value = direction.value === 'asc' ? 'desc' : 'asc'
}
</script>
<template>
  <select v-model="sortBy" data-testid="sort-by">
    <option value="name">Name</option>
    <option value="price">Price</option>
    <option value="rating">Rating</option>
  </select>
  <button data-testid="toggle" :data-direction="direction" @click="toggleDirection">
    {{ direction === 'asc' ? 'Ascending' : 'Descending' }}
  </button>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Price</th>
        <th>Rating</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in sortedProducts" :key="product.id" data-testid="row">
        <td data-testid="name">{{ product.name }}</td>
        <td data-testid="price">{{ product.price }}</td>
        <td data-testid="rating">{{ product.rating }}</td>
      </tr>
    </tbody>
  </table>
</template>
