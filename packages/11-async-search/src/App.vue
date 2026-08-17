<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import UserSearch from './components/UserSearch.vue'
</script>
<template>
  <ExerciseLayout title="11-async-search" :minutes="40">
    <UserSearch />
  </ExerciseLayout>
</template>
