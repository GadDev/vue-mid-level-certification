<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import ProductTable from './components/ProductTable.vue'
</script>
<template>
  <ExerciseLayout title="04-sort-products" :minutes="15">
    <ProductTable />
  </ExerciseLayout>
</template>
