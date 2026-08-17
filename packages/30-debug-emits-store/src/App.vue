<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import CounterPanel from './components/CounterPanel.vue'
import SearchPanel from './components/SearchPanel.vue'
</script>
<template>
  <ExerciseLayout title="30-debug-emits-store" :minutes="20">
    <SearchPanel />
    <CounterPanel />
  </ExerciseLayout>
</template>
