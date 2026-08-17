<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import EmployeeTable from './components/EmployeeTable.vue'
</script>
<template>
  <ExerciseLayout title="07-data-table-slots" :minutes="35">
    <EmployeeTable />
  </ExerciseLayout>
</template>
