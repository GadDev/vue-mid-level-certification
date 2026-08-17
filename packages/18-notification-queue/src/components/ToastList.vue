<script setup lang="ts">
import type { Toast } from '../composables/useToasts'

const props = defineProps<{ toasts: Toast[] }>()
const emit = defineEmits<{ dismiss: [id: number] }>()
</script>

<template>
  <!-- TODO: nothing in the DOM at all while the queue is empty -->
  <ul class="toasts" data-testid="toasts">
    <!-- TODO: each toast carries its type as a class, and its own dismiss button -->
    <li v-for="toast in props.toasts" :key="toast.id" data-testid="toast">
      <span data-testid="message">{{ toast.message }}</span>
      <button type="button" data-testid="dismiss">×</button>
    </li>
  </ul>
</template>
