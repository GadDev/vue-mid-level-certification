<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import Cart from './components/Cart.vue'
import Counter from './components/Counter.vue'
import Profile from './components/Profile.vue'
</script>
<template>
  <ExerciseLayout title="29-debug-reactivity" :minutes="25">
    <Counter />
    <Cart />
    <Profile />
  </ExerciseLayout>
</template>
