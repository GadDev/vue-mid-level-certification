<script setup lang="ts">
import { ref } from 'vue'
import { usePagination } from '../composables/usePagination'
import { users } from '../data/users'

const source = ref(users)
const { page, pageSize, pageCount, pageItems, isFirst, isLast, next, prev, setPageSize } =
  usePagination(source, 10)

function onSize(event: Event): void {
  setPageSize(Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <div>
    <ul>
      <li v-for="user in pageItems" :key="user.id" data-testid="row">{{ user.name }}</li>
    </ul>

    <button type="button" data-testid="prev" :disabled="isFirst" @click="prev">Previous</button>
    <span data-testid="status">Page {{ page }} of {{ pageCount }}</span>
    <button type="button" data-testid="next" :disabled="isLast" @click="next">Next</button>

    <select data-testid="size" :value="pageSize" @change="onSize">
      <option :value="10">10</option>
      <option :value="25">25</option>
      <option :value="50">50</option>
    </select>
  </div>
</template>
