<script setup lang="ts">
import { reactive } from 'vue'

// FIX: destructuring a reactive object copies the *values* out of the proxy.
// `count` was then a plain local number — reassigning it touched nothing the
// template depends on. Keep going through the proxy instead.
const state = reactive({ count: 0, step: 1 })

function increment(): void {
  state.count += state.step
}

function reset(): void {
  state.count = 0
}
</script>

<template>
  <div>
    <p data-testid="count">{{ state.count }}</p>
    <button type="button" data-testid="increment" @click="increment">+{{ state.step }}</button>
    <button type="button" data-testid="reset" @click="reset">Reset</button>
  </div>
</template>
