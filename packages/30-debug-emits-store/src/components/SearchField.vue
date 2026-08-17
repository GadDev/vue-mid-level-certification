<script setup lang="ts">
const props = defineProps<{ modelValue: string; label: string }>()

// BUG: the parent's `v-model` never updates, and clearing does nothing either.
const emit = defineEmits<{ changed: [value: string] }>()

function onInput(event: Event): void {
  emit('changed', (event.target as HTMLInputElement).value)
}

function clear(): void {
  emit('changed', '')
}
</script>

<template>
  <div>
    <label data-testid="label">{{ props.label }}</label>
    <input data-testid="input" :value="props.modelValue" @input="onInput" />
    <button type="button" data-testid="clear" @click="clear">Clear</button>
  </div>
</template>
