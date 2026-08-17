<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{ open: boolean; title?: string }>(), { title: 'Dialog' })
const emit = defineEmits<{ close: [] }>()

defineSlots<{
  header?: () => unknown
  default?: () => unknown
  footer?: (props: { close: () => void }) => unknown
}>()

function close(): void {
  emit('close')
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}

// The listener exists exactly as long as the modal is open — a listener that
// outlives the dialog closes the *next* one someone opens.
watch(
  () => props.open,
  isOpen => {
    if (isOpen) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="props.open" class="overlay" data-testid="overlay" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" data-testid="modal">
      <header>
        <slot name="header">
          <h2>{{ props.title }}</h2>
        </slot>
      </header>
      <section data-testid="body">
        <slot />
      </section>
      <footer>
        <slot name="footer" :close="close">
          <button type="button" data-testid="close" @click="close">Close</button>
        </slot>
      </footer>
    </div>
  </div>
</template>
