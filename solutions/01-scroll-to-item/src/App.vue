<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import ScrollList from './components/ScrollList.vue'
</script>
<template>
  <ExerciseLayout title="01-scroll-to-item" :minutes="25">
    <ScrollList />
  </ExerciseLayout>
</template>
