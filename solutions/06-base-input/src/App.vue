<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import { ref } from 'vue'
import SignupForm, { type Signup } from './components/SignupForm.vue'

const lastSignup = ref<Signup | null>(null)
</script>
<template>
  <ExerciseLayout title="06-base-input" :minutes="35">
    <SignupForm @submit="lastSignup = $event" />
    <p v-if="lastSignup" data-testid="result">Welcome, {{ lastSignup.name }}!</p>
  </ExerciseLayout>
</template>
