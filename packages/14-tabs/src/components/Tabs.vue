<script setup lang="ts">
import { ref } from 'vue'
import type { Tab } from '../data/tabs'

const props = defineProps<{ tabs: Tab[] }>()
const emit = defineEmits<{ change: [id: string | null] }>()

// TODO: the first tab is selected initially, and a data refresh must keep the
// selection when that tab is still in the new list — falling back to the first
// tab (or nothing at all) only when it disappeared.
const selectedId = ref<string | null>(null)

function select(id: string): void {
  // TODO: emit `change` only when the selection actually changes
  selectedId.value = id
}
</script>

<template>
  <div class="tabs">
    <div role="tablist">
      <!-- TODO: aria-selected and the `active` class must follow the selection -->
      <button
        v-for="tab in props.tabs"
        :key="tab.id"
        type="button"
        role="tab"
        aria-selected="false"
        :data-testid="`tab-${tab.id}`"
        @click="select(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <!-- TODO: render the selected tab's content here, and nothing when there is no tab -->
    <p data-testid="panel"></p>
    <p data-testid="empty">No tabs.</p>
  </div>
</template>
