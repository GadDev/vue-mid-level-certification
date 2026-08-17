<script setup lang="ts">
import { useId } from 'vue'

// inheritAttrs: false + v-bind="$attrs" on the input means extra attributes
// (placeholder, type, data-testid, aria-*) land on the real form control
// instead of the wrapper div.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label: string
    error?: string
    required?: boolean
  }>(),
  { error: '', required: false }
)

// defineModel is the whole v-model contract in one line: a writable ref that
// emits update:modelValue instead of mutating a prop.
const model = defineModel<string>({ required: true })

const id = useId()
const errorId = `${id}-error`
</script>
<template>
  <div class="field">
    <label :for="id">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <input
      :id="id"
      v-model="model"
      v-bind="$attrs"
      :required="required"
      :aria-invalid="Boolean(props.error)"
      :aria-describedby="props.error ? errorId : undefined"
    />
    <p v-if="props.error" :id="errorId" role="alert" data-testid="error">{{ props.error }}</p>
  </div>
</template>
<style scoped>
.field {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}
</style>
