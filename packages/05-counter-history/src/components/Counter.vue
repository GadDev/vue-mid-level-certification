<script setup lang="ts">
import { useCounterHistory } from '../composables/useCounterHistory'

const { count, canUndo, canRedo, increment, decrement, reset, undo, redo } = useCounterHistory(0)
</script>
<template>
  <p data-testid="count">{{ count }}</p>
  <button data-testid="decrement" @click="decrement">−</button>
  <button data-testid="increment" @click="increment">+</button>
  <button data-testid="reset" @click="reset">Reset</button>
  <!-- TODO: disable Undo / Redo when there is nothing to undo / redo -->
  <button data-testid="undo" @click="undo">Undo</button>
  <button data-testid="redo" @click="redo">Redo</button>
</template>
