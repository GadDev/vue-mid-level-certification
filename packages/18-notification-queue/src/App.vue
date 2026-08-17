<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import ToastList from './components/ToastList.vue'
import { useToasts } from './composables/useToasts'

const { toasts, notify, dismiss } = useToasts()
</script>
<template>
  <ExerciseLayout title="18-notification-queue" :minutes="30">
    <button type="button" @click="notify('Saved', 'success')">Notify</button>
    <ToastList :toasts="toasts" @dismiss="dismiss" />
  </ExerciseLayout>
</template>
