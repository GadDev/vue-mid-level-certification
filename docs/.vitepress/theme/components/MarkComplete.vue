<script setup lang="ts">
import { computed } from 'vue'
import { useProgress } from '../composables/useProgress'

const props = defineProps<{ id: string }>()

const { completed, toggle } = useProgress()

const isDone = computed(() => Boolean(completed.value[props.id]))
</script>

<template>
  <button
    type="button"
    class="mark-complete"
    :class="{ 'mark-complete-done': isDone }"
    :aria-pressed="isDone"
    @click="toggle(props.id)"
  >
    <span v-if="isDone">✓ Exercise {{ props.id }} complete</span>
    <span v-else>Mark Exercise {{ props.id }} complete</span>
  </button>
</template>

<style scoped>
.mark-complete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
}

.mark-complete:hover {
  border-color: var(--vp-c-brand-1);
}

.mark-complete-done {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}
</style>
