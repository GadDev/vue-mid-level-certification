<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import CopyButton from './components/CopyButton.vue'
</script>
<template>
  <ExerciseLayout title="23-clipboard" :minutes="25">
    <CopyButton text="npm create vue@latest" />
  </ExerciseLayout>
</template>
