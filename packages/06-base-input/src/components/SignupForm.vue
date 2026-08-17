<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

export interface Signup {
  name: string
  email: string
}

// TODO: declare a typed `submit` emit carrying the Signup payload

const name = ref('')
const email = ref('')
const submitted = ref(false)

// TODO: validation computeds (name required, email required + valid shape),
// errors shown only after a submit attempt, and an onSubmit that emits only
// when the form is valid — with trimmed values.
</script>
<template>
  <form data-testid="form">
    <BaseInput v-model="name" label="Name" required data-testid="name-input" />
    <BaseInput v-model="email" label="Email" type="email" required data-testid="email-input" />
    <!-- TODO: error summary -->
    <button data-testid="submit">Sign up</button>
  </form>
</template>
