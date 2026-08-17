<script setup lang="ts">
// FIX: `v-model` listens for `update:modelValue`. The component emitted
// `changed`, which nobody was listening for — the payload was correct and went
// nowhere. `defineModel` writes both halves of that contract for you.
const model = defineModel<string>({ required: true })
defineProps<{ label: string }>()

function onInput(event: Event): void {
  model.value = (event.target as HTMLInputElement).value
}

function clear(): void {
  model.value = ''
}
</script>

<template>
  <div>
    <label data-testid="label">{{ label }}</label>
    <input data-testid="input" :value="model" @input="onInput" />
    <button type="button" data-testid="clear" @click="clear">Clear</button>
  </div>
</template>
