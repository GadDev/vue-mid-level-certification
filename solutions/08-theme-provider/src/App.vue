<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import ThemedPanel from './components/ThemedPanel.vue'
import ThemeToggle from './components/ThemeToggle.vue'
</script>
<template>
  <ExerciseLayout title="08-theme-provider" :minutes="30">
    <ThemeToggle />
    <ThemedPanel />
  </ExerciseLayout>
</template>
