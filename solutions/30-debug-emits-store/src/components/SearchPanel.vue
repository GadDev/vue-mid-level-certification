<script setup lang="ts">
import { ref } from 'vue'
import SearchField from './SearchField.vue'

const term = ref('')
</script>

<template>
  <div>
    <SearchField v-model="term" label="Search" />
    <p data-testid="term">{{ term }}</p>
    <p v-if="term === ''" data-testid="empty">Type something.</p>
  </div>
</template>
