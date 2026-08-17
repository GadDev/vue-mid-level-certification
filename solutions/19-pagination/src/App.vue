<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import UserTable from './components/UserTable.vue'
</script>
<template>
  <ExerciseLayout title="19-pagination" :minutes="30">
    <UserTable />
  </ExerciseLayout>
</template>
