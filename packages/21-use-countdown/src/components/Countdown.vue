<script setup lang="ts">
import { useCountdown } from '../composables/useCountdown'

const { formatted, running, finished, start, pause, reset } = useCountdown(90)
</script>

<template>
  <div>
    <p data-testid="time">{{ formatted }}</p>
    <!-- TODO: start is disabled while running or finished, pause only works while running -->
    <button type="button" data-testid="start" @click="start">Start</button>
    <button type="button" data-testid="pause" @click="pause">Pause</button>
    <button type="button" data-testid="reset" @click="reset()">Reset</button>
    <!-- TODO: show this only once the countdown has finished -->
    <p data-testid="done">Time's up!</p>
  </div>
</template>
