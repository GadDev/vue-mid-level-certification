<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import NotesPanel from './components/NotesPanel.vue'
</script>
<template>
  <ExerciseLayout title="12-composable-storage" :minutes="35">
    <NotesPanel />
  </ExerciseLayout>
</template>
