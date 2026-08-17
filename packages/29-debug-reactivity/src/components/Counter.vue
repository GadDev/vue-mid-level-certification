<script setup lang="ts">
import { reactive } from 'vue'

// BUG: the display never moves, even though `increment` clearly runs.
const state = reactive({ count: 0, step: 1 })
let { count, step } = state

function increment(): void {
  count += step
}

function reset(): void {
  count = 0
}
</script>

<template>
  <div>
    <p data-testid="count">{{ count }}</p>
    <button type="button" data-testid="increment" @click="increment">+{{ step }}</button>
    <button type="button" data-testid="reset" @click="reset">Reset</button>
  </div>
</template>
