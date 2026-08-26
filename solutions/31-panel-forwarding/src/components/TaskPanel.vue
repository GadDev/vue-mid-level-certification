<script setup lang="ts">
import { computed, ref } from 'vue'
import { tasks } from '../data/tasks'
import PanelFrame from './PanelFrame.vue'

const showAll = ref(true)

const rows = computed(() => (showAll.value ? tasks.value : []))
const doneCount = computed(() => rows.value.filter(task => task.done).length)
</script>

<template>
  <button data-testid="toggle" @click="showAll = !showAll">Toggle tasks</button>

  <PanelFrame title="Tasks" :items="rows">
    <template #header>Tasks</template>
    <template #item="{ item, index }">
      <span data-testid="cell-index">{{ index + 1 }}</span>
      <span data-testid="cell-label">{{ item.label }}</span>
      <span data-testid="cell-done">{{ item.done ? 'Yes' : 'No' }}</span>
    </template>
    <template #empty>
      <span data-testid="custom-empty">No tasks yet.</span>
    </template>
    <template #footer="{ count }">
      <span data-testid="custom-footer">{{ count }} tasks, {{ doneCount }} done</span>
    </template>
  </PanelFrame>
</template>
