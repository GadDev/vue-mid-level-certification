<script setup lang="ts">
import { useCounterHistory } from '../composables/useCounterHistory'

// All the state and the rules live in the composable; the component only wires
// them to the DOM. That is what makes the logic testable without mounting.
const { count, canUndo, canRedo, increment, decrement, reset, undo, redo } = useCounterHistory(0)
</script>
<template>
  <p data-testid="count">{{ count }}</p>
  <button data-testid="decrement" @click="decrement">−</button>
  <button data-testid="increment" @click="increment">+</button>
  <button data-testid="reset" @click="reset">Reset</button>
  <button data-testid="undo" :disabled="!canUndo" @click="undo">Undo</button>
  <button data-testid="redo" :disabled="!canRedo" @click="redo">Redo</button>
</template>
