<script setup lang="ts">
import { ref } from 'vue'
import { useProgress } from '../composables/useProgress'

const EXERCISES = [
  { id: '01', label: '01 Scroll to Item — 16/16 green, typecheck clean' },
  { id: '02', label: '02 Shopping List — 14/14 green, typecheck clean' },
  { id: '03', label: '03 Search Users — 15/15 green, typecheck clean' },
  { id: '04', label: '04 Sort Products — 9/9 green, typecheck clean' },
  { id: '05', label: '05 Counter History — 20/20 green, typecheck clean' },
  { id: '06', label: '06 Base Input & Form — 20/20 green, typecheck clean' },
  { id: '07', label: '07 Data Table with Slots — 17/17 green, typecheck clean' },
  { id: '08', label: '08 Theme Provider — 11/11 green, typecheck clean' },
  { id: '09', label: '09 Router Master / Detail — 11/11 green, typecheck clean' },
  { id: '10', label: '10 Pinia Cart — 28/28 green, typecheck clean' },
  { id: '11', label: '11 Async Search — 20/20 green, typecheck clean' },
  { id: '12', label: '12 Composable Storage — 18/18 green, typecheck clean' },
  { id: '13', label: '13 Accordion — 10/10 green, typecheck clean' },
  { id: '14', label: '14 Dynamic Tabs — 11/11 green, typecheck clean' },
  { id: '15', label: '15 Dynamic Form — 12/12 green, typecheck clean' },
  { id: '16', label: '16 Rating — 15/15 green, typecheck clean' },
  { id: '17', label: '17 Modal — 14/14 green, typecheck clean' },
  { id: '18', label: '18 Notification Queue — 18/18 green, typecheck clean' },
  { id: '19', label: '19 Pagination — 18/18 green, typecheck clean' },
  { id: '20', label: '20 Infinite Scroll — 19/19 green, typecheck clean' },
  { id: '21', label: '21 useCountdown() — 22/22 green, typecheck clean' },
  { id: '22', label: '22 useFetch() — 19/19 green, typecheck clean' },
  { id: '23', label: '23 Clipboard — 15/15 green, typecheck clean' },
  { id: '24', label: '24 Pinia Wishlist — 18/18 green, typecheck clean' },
  { id: '25', label: '25 Auth Store & Route Guards — 21/21 green, typecheck clean' },
  { id: '26', label: '26 Dashboard Stats — 18/18 green, typecheck clean' },
  { id: '27', label: '27 Query Filters — 16/16 green, typecheck clean' },
  { id: '28', label: '28 Breadcrumbs — 10/10 green, typecheck clean' },
  { id: '29', label: '29 Debug: Reactivity, Computed & Watch — 15/15 green, typecheck clean' },
  { id: '30', label: '30 Debug: Emits & Pinia — 9/9 green, typecheck clean' },
  { id: '31', label: '31 Panel Forwarding — 18/18 green, typecheck clean' },
]

const { completed, toggle, count, total, percent, reset, setAll } = useProgress()

const exportText = ref('')
const importText = ref('')
const importError = ref('')

function exportProgress() {
  exportText.value = JSON.stringify(completed.value, null, 2)
}

function importProgress() {
  importError.value = ''
  try {
    const parsed = JSON.parse(importText.value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      importError.value = 'Import failed: expected a JSON object.'
      return
    }
    setAll(parsed)
  } catch {
    importError.value = 'Import failed: invalid JSON.'
  }
}

function resetProgress() {
  if (window.confirm('Reset all progress? This cannot be undone.')) {
    reset()
  }
}
</script>

<template>
  <div class="progress-checklist">
    <div class="progress-checklist-summary">
      <strong>{{ count }} / {{ total }} complete ({{ percent }}%)</strong>
      <button type="button" class="progress-checklist-reset" @click="resetProgress">
        Reset progress
      </button>
    </div>

    <ul class="progress-checklist-list">
      <li v-for="exercise in EXERCISES" :key="exercise.id">
        <label class="progress-checklist-item">
          <input
            type="checkbox"
            :checked="Boolean(completed[exercise.id])"
            @change="toggle(exercise.id)"
          />
          <span :class="{ 'progress-checklist-done': completed[exercise.id] }">
            {{ exercise.label }}
          </span>
        </label>
      </li>
    </ul>

    <details class="progress-checklist-transfer">
      <summary>Export / Import progress</summary>
      <p class="progress-checklist-note">
        Progress is stored in your browser only — export this if you're studying across
        multiple devices.
      </p>

      <div class="progress-checklist-transfer-row">
        <button type="button" @click="exportProgress">Export</button>
        <textarea v-model="exportText" readonly rows="4" placeholder="Exported JSON appears here" />
      </div>

      <div class="progress-checklist-transfer-row">
        <button type="button" @click="importProgress">Import</button>
        <textarea v-model="importText" rows="4" placeholder="Paste exported JSON here" />
      </div>
      <p v-if="importError" class="progress-checklist-error">{{ importError }}</p>
    </details>
  </div>
</template>

<style scoped>
.progress-checklist-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-checklist-reset {
  padding: 4px 10px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
}

.progress-checklist-reset:hover {
  color: var(--vp-c-danger-1);
  border-color: var(--vp-c-danger-1);
}

.progress-checklist-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.progress-checklist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
}

.progress-checklist-done {
  color: var(--vp-c-text-2);
  text-decoration: line-through;
}

.progress-checklist-transfer {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.progress-checklist-note {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.progress-checklist-transfer-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.progress-checklist-transfer-row textarea {
  width: 100%;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  padding: 8px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  resize: vertical;
}

.progress-checklist-transfer-row button {
  align-self: flex-start;
  padding: 4px 10px;
  font-size: 13px;
  background-color: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
}

.progress-checklist-error {
  color: var(--vp-c-danger-1);
  font-size: 13px;
}
</style>
