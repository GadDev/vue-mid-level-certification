<script setup lang="ts">
import { useCounterStore } from '../stores/counter'

// BUG: the buttons work — the store really does change — but the panel is frozen.
const { count, double, increment, reset } = useCounterStore()
</script>

<template>
  <div>
    <p data-testid="count">{{ count }}</p>
    <p data-testid="double">{{ double }}</p>
    <button type="button" data-testid="increment" @click="increment">+</button>
    <button type="button" data-testid="reset" @click="reset">Reset</button>
  </div>
</template>
