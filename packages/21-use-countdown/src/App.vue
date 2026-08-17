<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import Countdown from './components/Countdown.vue'
</script>
<template>
  <ExerciseLayout title="21-use-countdown" :minutes="30">
    <Countdown />
  </ExerciseLayout>
</template>
