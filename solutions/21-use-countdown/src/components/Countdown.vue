<script setup lang="ts">
import { useCountdown } from '../composables/useCountdown'

const { formatted, running, finished, start, pause, reset } = useCountdown(90)
</script>

<template>
  <div>
    <p data-testid="time">{{ formatted }}</p>
    <button type="button" data-testid="start" :disabled="running || finished" @click="start">
      Start
    </button>
    <button type="button" data-testid="pause" :disabled="!running" @click="pause">Pause</button>
    <button type="button" data-testid="reset" @click="reset()">Reset</button>
    <p v-if="finished" data-testid="done">Time's up!</p>
  </div>
</template>
