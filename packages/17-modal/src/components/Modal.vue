<script setup lang="ts">
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

// TODO: while — and only while — the modal is open, Escape closes it.
// Add the listener when it opens, remove it when it closes or the component goes away.
</script>

<template>
  <!-- TODO: nothing at all in the DOM while closed -->
  <div class="overlay" data-testid="overlay">
    <!-- TODO: a click on the backdrop closes; a click inside the dialog must not -->
    <div class="modal" role="dialog" data-testid="modal">
      <header>
        <!-- TODO: the header slot falls back to the title prop -->
        <slot name="header" />
      </header>
      <section data-testid="body">
        <slot />
      </section>
      <footer>
        <!-- TODO: the footer slot hands `close` back out, and falls back to a close button -->
        <slot name="footer" :close="close" />
      </footer>
    </div>
  </div>
</template>
