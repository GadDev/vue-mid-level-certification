<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PAGE_SIZE, products } from '../data/products'

export type Sort = 'name' | 'price'

const route = useRoute()
const router = useRouter()

/** A query value can be a string, an array of strings, or absent. */
function first(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : value === undefined ? '' : String(value)
}

// TODO: read the state out of the URL — it is the single source of truth here.
// `q` defaults to '', `sort` to 'name' (anything else is invalid), `page` to 1
// (non-numeric, zero and negative values included).
const q = computed(() => '')
const sort = computed<Sort>(() => 'name')
const page = computed(() => 1)

const filtered = computed(() => products)
const pageCount = computed(() => 1)
const rows = computed(() => filtered.value.slice(0, PAGE_SIZE))

function update(next: { q?: string; sort?: Sort; page?: number }): void {
  // TODO: write the new state back into the query. Defaults are left out of the
  // URL entirely, and changing the search or the sort sends the user to page 1.
  void next
  void router
  void first
  void route
}
</script>

<template>
  <div>
    <input data-testid="q" :value="q" @input="update({ q: ($event.target as HTMLInputElement).value })" />
    <select data-testid="sort" :value="sort">
      <option value="name">Name</option>
      <option value="price">Price</option>
    </select>

    <ul>
      <li v-for="product in rows" :key="product.id" data-testid="row">{{ product.name }}</li>
    </ul>
    <p v-if="rows.length === 0" data-testid="empty">Nothing matches.</p>

    <button type="button" data-testid="prev" @click="update({ page: page - 1 })">Previous</button>
    <span data-testid="status">Page {{ page }} of {{ pageCount }}</span>
    <button type="button" data-testid="next" @click="update({ page: page + 1 })">Next</button>
  </div>
</template>
