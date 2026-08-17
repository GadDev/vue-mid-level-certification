<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import { ref } from 'vue'
import Rating from './components/Rating.vue'

const score = ref(3)
</script>
<template>
  <ExerciseLayout title="16-rating" :minutes="30">
    <Rating v-model="score" />
  </ExerciseLayout>
</template>
