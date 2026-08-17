<script setup lang="ts">
import { ref } from 'vue'
import { products } from '../data/products'

// TODO: give both controls union types ('name' | 'price' | 'rating' and
// 'asc' | 'desc'). Left as the inferred `string`, indexing a Product by the
// sort key will not typecheck — that is the point.
const sortBy = ref('name')
const direction = ref('asc')

// TODO: a `sortedProducts` computed that never mutates `products.value`,
// plus `toggleDirection`. Numbers must sort numerically, ties deterministically.
</script>
<template>
  <select v-model="sortBy" data-testid="sort-by">
    <option value="name">Name</option>
    <option value="price">Price</option>
    <option value="rating">Rating</option>
  </select>
  <button data-testid="toggle" :data-direction="direction">Toggle order</button>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Price</th>
        <th>Rating</th>
      </tr>
    </thead>
    <tbody>
      <!-- TODO: one row per sorted product. The DOM contract table in the README
           lists the five data-testid attributes this table owes the specs, and
           the key each row needs. -->
    </tbody>
  </table>
</template>
