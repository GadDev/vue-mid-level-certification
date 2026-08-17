<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '../stores/counter'

// FIX: destructuring the store copies the current *values* of state and getters.
// `storeToRefs` keeps them reactive; actions are plain functions and can be
// taken off the store as they are.
const store = useCounterStore()
const { count, double } = storeToRefs(store)
const { increment, reset } = store
</script>

<template>
  <div>
    <p data-testid="count">{{ count }}</p>
    <p data-testid="double">{{ double }}</p>
    <button type="button" data-testid="increment" @click="increment">+</button>
    <button type="button" data-testid="reset" @click="reset">Reset</button>
  </div>
</template>
