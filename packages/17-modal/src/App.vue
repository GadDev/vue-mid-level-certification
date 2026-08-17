<script setup lang="ts">
import { ExerciseLayout } from '@practice/exercise-shell'
import { ref } from 'vue'
import Modal from './components/Modal.vue'

const open = ref(false)
</script>
<template>
  <ExerciseLayout title="17-modal" :minutes="30">
    <button type="button" @click="open = true">Open</button>
    <Modal :open="open" title="Delete file" @close="open = false">
      <p>This cannot be undone.</p>
    </Modal>
  </ExerciseLayout>
</template>
