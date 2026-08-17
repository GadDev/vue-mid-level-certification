<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import type { FieldValue, FormField } from '../data/schema'

const props = defineProps<{ fields: FormField[] }>()
const emit = defineEmits<{ submit: [values: Record<string, FieldValue>] }>()

const values = ref<Record<string, FieldValue>>({})
const submitted = ref(false)
const formId = useId()

function blank(field: FormField): FieldValue {
  if (field.type === 'checkbox') return false
  if (field.type === 'number') return null
  return ''
}

// The schema owns the shape of the model, so re-seed whenever it changes.
watch(
  () => props.fields,
  fields => {
    values.value = Object.fromEntries(fields.map(field => [field.name, blank(field)]))
    submitted.value = false
  },
  { immediate: true }
)

function controlId(field: FormField): string {
  return `${formId}-${field.name}`
}

function isMissing(field: FormField): boolean {
  const value = values.value[field.name]
  if (field.type === 'checkbox') return value !== true
  if (field.type === 'number') return value === null
  return String(value ?? '').trim() === ''
}

function errorFor(field: FormField): string {
  if (!submitted.value || !field.required || !isMissing(field)) return ''
  return `${field.label} is required`
}

function setText(field: FormField, event: Event): void {
  values.value[field.name] = (event.target as HTMLInputElement | HTMLSelectElement).value
}

function setNumber(field: FormField, event: Event): void {
  const raw = (event.target as HTMLInputElement).value.trim()
  values.value[field.name] = raw === '' ? null : Number(raw)
}

function setChecked(field: FormField, event: Event): void {
  values.value[field.name] = (event.target as HTMLInputElement).checked
}

function onSubmit(): void {
  submitted.value = true
  if (props.fields.some(field => field.required && isMissing(field))) return

  const payload = Object.fromEntries(
    props.fields.map(field => {
      const value = values.value[field.name]
      return [field.name, typeof value === 'string' ? value.trim() : value]
    })
  )
  emit('submit', payload)
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div v-for="field in props.fields" :key="field.name">
      <label :for="controlId(field)">{{ field.label }}</label>

      <select
        v-if="field.type === 'select'"
        :id="controlId(field)"
        :data-testid="`field-${field.name}`"
        :value="values[field.name]"
        @change="setText(field, $event)"
      >
        <option v-for="option in field.options ?? []" :key="option" :value="option">
          {{ option }}
        </option>
      </select>

      <input
        v-else-if="field.type === 'checkbox'"
        :id="controlId(field)"
        type="checkbox"
        :data-testid="`field-${field.name}`"
        :checked="values[field.name] === true"
        @change="setChecked(field, $event)"
      />

      <input
        v-else-if="field.type === 'number'"
        :id="controlId(field)"
        type="number"
        :data-testid="`field-${field.name}`"
        :value="values[field.name] ?? ''"
        @input="setNumber(field, $event)"
      />

      <input
        v-else
        :id="controlId(field)"
        :type="field.type"
        :data-testid="`field-${field.name}`"
        :value="values[field.name]"
        @input="setText(field, $event)"
      />

      <p v-if="errorFor(field)" role="alert" :data-testid="`error-${field.name}`">
        {{ errorFor(field) }}
      </p>
    </div>
    <button type="submit" data-testid="submit">Send</button>
  </form>
</template>
