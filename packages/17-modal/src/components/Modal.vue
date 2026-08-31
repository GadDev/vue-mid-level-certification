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
<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
  padding: 1rem;
  z-index: 1000;
}

.modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 20px 40px rgb(0 0 0 / 20%);
  overflow: hidden;
}

.modal header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.modal [data-testid='body'] {
  padding: 1.25rem;
  overflow-y: auto;
  color: #374151;
  line-height: 1.5;
}

.modal footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal footer button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.modal footer button:hover {
  background: #f3f4f6;
}

.modal footer button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
</style>