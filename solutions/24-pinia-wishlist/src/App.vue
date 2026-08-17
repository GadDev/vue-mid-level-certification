<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import ProductList from './components/ProductList.vue'
</script>
<template>
  <ExerciseLayout title="24-pinia-wishlist" :minutes="35">
    <ProductList />
  </ExerciseLayout>
</template>
