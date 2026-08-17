<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PAGE_SIZE, type Product, products } from '../data/products'

export type Sort = 'name' | 'price'

const route = useRoute()
const router = useRouter()

/** A query value can be a string, an array of strings, or absent. */
function first(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : value === undefined ? '' : String(value)
}

// Everything is derived from the URL: no local copy to keep in sync, and the
// back button, a deep link and a click all go through the same path.
const q = computed(() => first(route.query.q).trim())

const sort = computed<Sort>(() => (first(route.query.sort) === 'price' ? 'price' : 'name'))

const filtered = computed<Product[]>(() => {
  const term = q.value.toLowerCase()
  const matching = term ? products.filter(p => p.name.toLowerCase().includes(term)) : products
  // Copy before sorting: `products` is shared module state.
  return [...matching].sort((a, b) =>
    sort.value === 'price' ? a.price - b.price : a.name.localeCompare(b.name)
  )
})

const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

const page = computed(() => {
  const parsed = Number(first(route.query.page))
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return Math.min(parsed, pageCount.value)
})

const rows = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

function update(next: { q?: string; sort?: Sort; page?: number }): void {
  const changesFilter = next.q !== undefined || next.sort !== undefined
  const target = {
    q: next.q ?? q.value,
    sort: next.sort ?? sort.value,
    // A new search or sort means the old page number is meaningless.
    page: changesFilter ? 1 : Math.max(1, next.page ?? page.value),
  }

  // Defaults stay out of the URL, so a pristine view has a clean address.
  const query: Record<string, string> = {}
  if (target.q !== '') query.q = target.q
  if (target.sort !== 'name') query.sort = target.sort
  if (target.page !== 1) query.page = String(target.page)

  router.push({ query })
}
</script>

<template>
  <div>
    <input
      data-testid="q"
      :value="q"
      @input="update({ q: ($event.target as HTMLInputElement).value })"
    />
    <select
      data-testid="sort"
      :value="sort"
      @change="update({ sort: ($event.target as HTMLSelectElement).value as Sort })"
    >
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
