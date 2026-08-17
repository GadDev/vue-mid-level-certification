<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import DynamicForm from './components/DynamicForm.vue'
import { type FieldValue, schema } from './data/schema'

function onSubmit(values: Record<string, FieldValue>): void {
  console.log('submitted', values)
}
</script>
<template>
  <ExerciseLayout title="15-dynamic-form" :minutes="35">
    <DynamicForm :fields="schema" @submit="onSubmit" />
  </ExerciseLayout>
</template>
