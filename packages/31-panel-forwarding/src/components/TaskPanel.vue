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

  <!--
    TODO: fill every slot PanelFrame forwards from DataPanel:
    #header with the text "Tasks",
    #item="{ item, index }" with cell-index (1-based), cell-label and cell-done
    ("Yes"/"No") cells,
    #empty with a custom-empty message,
    #footer="{ count }" with a custom-footer showing count and doneCount.
    `items` isn't a prop PanelFrame declares itself — it must still reach DataPanel.
  -->
  <PanelFrame title="Tasks" :items="rows" />
</template>
