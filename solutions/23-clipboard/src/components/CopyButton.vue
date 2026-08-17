<script setup lang="ts">
import { useClipboard } from '../composables/useClipboard'

const props = defineProps<{ text: string }>()
const { copied, error, isSupported, copy } = useClipboard()
</script>

<template>
  <div>
    <button type="button" data-testid="copy" :disabled="!isSupported" @click="copy(props.text)">
      {{ copied ? 'Copied!' : 'Copy' }}
    </button>
    <p v-if="error" data-testid="error" role="alert">{{ error }}</p>
  </div>
</template>
