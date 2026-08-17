<script setup lang="ts">
import type { Toast } from '../composables/useToasts'

const props = defineProps<{ toasts: Toast[] }>()
const emit = defineEmits<{ dismiss: [id: number] }>()
</script>

<template>
  <ul v-if="props.toasts.length > 0" class="toasts" data-testid="toasts">
    <li v-for="toast in props.toasts" :key="toast.id" :class="toast.type" data-testid="toast">
      <span data-testid="message">{{ toast.message }}</span>
      <button type="button" data-testid="dismiss" @click="emit('dismiss', toast.id)">×</button>
    </li>
  </ul>
</template>
