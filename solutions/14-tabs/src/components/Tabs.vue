<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Tab } from '../data/tabs'

const props = defineProps<{ tabs: Tab[] }>()
const emit = defineEmits<{ change: [id: string | null] }>()

const selectedId = ref<string | null>(props.tabs[0]?.id ?? null)

// The selection is an id, not an index or a Tab object: a refresh hands us new
// objects (and possibly a different order), and only the id survives that.
watch(
  () => props.tabs,
  list => {
    if (list.some(tab => tab.id === selectedId.value)) return
    selectedId.value = list[0]?.id ?? null
  }
)

const selected = computed(() => props.tabs.find(tab => tab.id === selectedId.value) ?? null)

function select(id: string): void {
  if (id === selectedId.value) return
  selectedId.value = id
  emit('change', id)
}
</script>

<template>
  <div class="tabs">
    <div role="tablist">
      <button
        v-for="tab in props.tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="tab.id === selectedId"
        :class="{ active: tab.id === selectedId }"
        :data-testid="`tab-${tab.id}`"
        @click="select(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <p v-if="selected" data-testid="panel">{{ selected.content }}</p>
    <p v-else data-testid="empty">No tabs.</p>
  </div>
</template>
