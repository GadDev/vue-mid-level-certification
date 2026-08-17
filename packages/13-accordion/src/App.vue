<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import Accordion from './components/Accordion.vue'
import { sections } from './data/sections'
</script>
<template>
  <ExerciseLayout title="13-accordion" :minutes="20">
    <Accordion :sections="sections" />
  </ExerciseLayout>
</template>
