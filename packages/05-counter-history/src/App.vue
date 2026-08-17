<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import Counter from './components/Counter.vue'
</script>
<template>
  <ExerciseLayout title="05-counter-history" :minutes="30">
    <Counter />
  </ExerciseLayout>
</template>
