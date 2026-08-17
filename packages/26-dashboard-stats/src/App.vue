<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import StatsPanel from './components/StatsPanel.vue'
</script>
<template>
  <ExerciseLayout title="26-dashboard-stats" :minutes="30">
    <StatsPanel />
  </ExerciseLayout>
</template>
