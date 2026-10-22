<script setup lang="ts">
import { useProgress } from '../composables/useProgress'

const { count, total, percent } = useProgress()
</script>

<template>
  <div class="progress-widget" :title="`${count} of ${total} exercises complete`">
    <span class="progress-widget-label">{{ count }} / {{ total }} ({{ percent }}%)</span>
    <span class="progress-widget-bar">
      <span class="progress-widget-bar-fill" :style="{ width: `${percent}%` }" />
    </span>
  </div>
</template>

<style scoped>
.progress-widget {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.progress-widget-bar {
  display: inline-block;
  width: 56px;
  height: 5px;
  border-radius: 3px;
  background-color: var(--vp-c-default-soft);
  overflow: hidden;
}

.progress-widget-bar-fill {
  display: block;
  height: 100%;
  background-color: var(--vp-c-brand-1);
  transition: width 0.2s ease;
}

@media (max-width: 960px) {
  .progress-widget {
    display: none;
  }
}
</style>
