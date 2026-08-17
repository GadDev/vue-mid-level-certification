<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import CartSummary from './components/CartSummary.vue'
import ProductList from './components/ProductList.vue'
</script>
<template>
  <ExerciseLayout title="10-pinia-cart" :minutes="40">
    <ProductList />
    <CartSummary />
  </ExerciseLayout>
</template>
