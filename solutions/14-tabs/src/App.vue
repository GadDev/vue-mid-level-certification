<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import Tabs from './components/Tabs.vue'
import { tabs } from './data/tabs'
</script>
<template>
  <ExerciseLayout title="14-tabs" :minutes="25">
    <Tabs :tabs="tabs" />
  </ExerciseLayout>
</template>
