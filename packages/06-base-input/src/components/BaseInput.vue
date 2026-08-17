<script setup lang="ts">
import { useId } from 'vue'

// TODO: extra attributes (placeholder, type, data-testid) must end up on the
// <input>, not on the wrapper div. Two pieces are missing for that.

const props = withDefaults(
  defineProps<{
    label: string
    error?: string
    required?: boolean
  }>(),
  { error: '', required: false }
)

// TODO: replace this with the v-model contract (defineModel) — never mutate a prop.
const model = defineModel<string>({ required: true })

const id = useId()
</script>
<template>
  <div class="field">
    <!-- TODO: label bound to the input, required marker, aria-invalid,
         and the error message with role="alert" -->
    <label>{{ label }}</label>
    <input :id="id" :required="required" />
  </div>
</template>
<style scoped>
.field {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}
</style>
