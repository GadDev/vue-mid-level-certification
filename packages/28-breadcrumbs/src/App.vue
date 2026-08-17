<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import Breadcrumbs from './components/Breadcrumbs.vue'
</script>
<template>
  <ExerciseLayout title="28-breadcrumbs" :minutes="30">
    <Breadcrumbs />
    <RouterView />
  </ExerciseLayout>
</template>
