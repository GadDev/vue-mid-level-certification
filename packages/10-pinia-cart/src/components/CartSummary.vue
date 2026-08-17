<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
// TODO: destructure state and getters with storeToRefs so they stay reactive
const code = ref('')
</script>
<template>
  <p data-testid="count">{{ cart.itemCount }}</p>
  <!-- TODO: empty state, one row per line with a qty input and a Remove button,
       the discount form + error, subtotal / discount / total (2 decimals),
       and a Clear button -->
  <p data-testid="subtotal">{{ cart.subtotal.toFixed(2) }}</p>
  <p data-testid="total">{{ cart.total.toFixed(2) }}</p>
</template>
