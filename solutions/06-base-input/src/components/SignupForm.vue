<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseInput from './BaseInput.vue'

export interface Signup {
  name: string
  email: string
}

// Typed emits: the parent gets a fully typed payload, and TypeScript rejects
// emitting the wrong shape.
const emit = defineEmits<{
  submit: [payload: Signup]
}>()

const name = ref('')
const email = ref('')
const submitted = ref(false)

const nameError = computed(() => (name.value.trim() ? '' : 'Name is required.'))
const emailError = computed(() => {
  const value = email.value.trim()
  if (!value) return 'Email is required.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.'
})

const isValid = computed(() => !nameError.value && !emailError.value)

// Errors are only shown once the user has tried to submit — a computed pair
// keeps "is it valid" and "should we say so" separate.
const shownNameError = computed(() => (submitted.value ? nameError.value : ''))
const shownEmailError = computed(() => (submitted.value ? emailError.value : ''))

function onSubmit(): void {
  submitted.value = true
  if (!isValid.value) return
  emit('submit', { name: name.value.trim(), email: email.value.trim() })
}
</script>
<template>
  <form data-testid="form" @submit.prevent="onSubmit">
    <BaseInput
      v-model="name"
      label="Name"
      required
      :error="shownNameError"
      data-testid="name-input"
      placeholder="Ada Lovelace"
    />
    <BaseInput
      v-model="email"
      label="Email"
      type="email"
      required
      :error="shownEmailError"
      data-testid="email-input"
    />
    <p v-if="submitted && !isValid" data-testid="summary" role="alert">
      Please fix the errors above.
    </p>
    <button data-testid="submit">Sign up</button>
  </form>
</template>
