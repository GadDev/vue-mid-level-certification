<script setup lang="ts">
import { ref } from 'vue'
import type { FieldValue, FormField } from '../data/schema'

const props = defineProps<{ fields: FormField[] }>()
const emit = defineEmits<{ submit: [values: Record<string, FieldValue>] }>()

// TODO: seed one entry per field — '' for text/email/select, null for number,
// false for checkbox — and re-seed when the schema changes.
const values = ref<Record<string, FieldValue>>({})

const submitted = ref(false)

function errorFor(field: FormField): string {
  // TODO: '' unless the field is required and empty, and only after a submit attempt.
  // A checkbox is "empty" while unchecked; ' ' is empty for a text field.
  return field.required ? '' : ''
}

function onSubmit(): void {
  submitted.value = true
  // TODO: emit `submit` with the collected values — but only when nothing is missing.
  // Strings are trimmed, a number field is a number (or null), a checkbox a boolean.
  emit('submit', values.value)
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div v-for="field in props.fields" :key="field.name">
      <!-- TODO: wire the label to its control with matching for / id -->
      <label>{{ field.label }}</label>

      <!-- TODO: one control per field type — select with its options, checkbox,
           and a plain input carrying the field's own type attribute -->
      <input :data-testid="`field-${field.name}`" type="text" />

      <!-- TODO: show this only when the field has an error -->
      <p role="alert" :data-testid="`error-${field.name}`">{{ field.label }} is required</p>
    </div>
    <button type="submit" data-testid="submit">Send</button>
  </form>
</template>
