<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import Feed from './components/Feed.vue'
</script>
<template>
  <ExerciseLayout title="20-infinite-scroll" :minutes="35">
    <Feed />
  </ExerciseLayout>
</template>
