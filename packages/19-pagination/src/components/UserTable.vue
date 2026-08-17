<script setup lang="ts">
import { ref } from 'vue'
import { usePagination } from '../composables/usePagination'
import { users } from '../data/users'

const source = ref(users)
const { page, pageSize, pageCount, pageItems, isFirst, isLast, next, prev, setPageSize } =
  usePagination(source, 10)
</script>

<template>
  <div>
    <ul>
      <li v-for="user in pageItems" :key="user.id" data-testid="row">{{ user.name }}</li>
    </ul>

    <!-- TODO: disable prev on the first page and next on the last one -->
    <button type="button" data-testid="prev" @click="prev">Previous</button>
    <span data-testid="status">Page {{ page }} of {{ pageCount }}</span>
    <button type="button" data-testid="next" @click="next">Next</button>

    <!-- TODO: changing the size must go through setPageSize, with a number -->
    <select data-testid="size" :value="pageSize">
      <option :value="10">10</option>
      <option :value="25">25</option>
      <option :value="50">50</option>
    </select>
  </div>
</template>
