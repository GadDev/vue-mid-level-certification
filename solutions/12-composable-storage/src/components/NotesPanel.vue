<script setup lang="ts">
import { computed } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useWindowSize } from '../composables/useWindowSize'

export interface Note {
  text: string
  pinned: boolean
}

const note = useLocalStorage<Note>('note', { text: '', pinned: false })
const { width } = useWindowSize()

const layout = computed(() => (width.value < 700 ? 'narrow' : 'wide'))
</script>
<template>
  <input v-model="note.text" data-testid="note" placeholder="Your note" />
  <label>
    <input v-model="note.pinned" type="checkbox" data-testid="pinned" />
    Pinned
  </label>
  <p data-testid="width">{{ width }}</p>
  <p data-testid="layout">{{ layout }}</p>
  <button data-testid="clear" @click="note = { text: '', pinned: false }">Clear</button>
</template>
