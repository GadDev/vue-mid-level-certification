<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import UserSearch from './components/UserSearch.vue'
</script>
<template>
  <ExerciseLayout title="03-search-users" :minutes="25">
    <UserSearch />
  </ExerciseLayout>
</template>
