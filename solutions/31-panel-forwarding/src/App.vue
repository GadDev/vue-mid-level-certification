<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import TaskPanel from './components/TaskPanel.vue'
</script>
<template>
  <ExerciseLayout title="31-panel-forwarding" :minutes="35">
    <TaskPanel />
  </ExerciseLayout>
</template>
