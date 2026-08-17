<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import ShoppingList from './components/ShoppingList.vue'
</script>
<template>
  <ExerciseLayout title="02-shopping-list" :minutes="30">
    <ShoppingList />
  </ExerciseLayout>
</template>
