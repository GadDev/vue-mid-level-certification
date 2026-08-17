<script setup lang="ts">
import { useClipboard } from '../composables/useClipboard'

const props = defineProps<{ text: string }>()
const { copied, error, isSupported, copy } = useClipboard()
</script>

<template>
  <div>
    <!-- TODO: the label becomes "Copied!" while the flash lasts, and the button
         is disabled when the clipboard is unavailable -->
    <button type="button" data-testid="copy" @click="copy(props.text)">Copy</button>
    <p data-testid="error" role="alert">{{ error }}</p>
  </div>
</template>
