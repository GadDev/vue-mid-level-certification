<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
// storeToRefs keeps state and getters reactive when destructured; actions are
// plain functions and must be taken off the store itself.
const { lines, itemCount, isEmpty, subtotal, discount, total, discountError } = storeToRefs(cart)

const code = ref('')
function apply(): void {
  cart.applyDiscount(code.value)
}
</script>
<template>
  <p data-testid="count">{{ itemCount }}</p>
  <p v-if="isEmpty" data-testid="empty">Your cart is empty.</p>
  <ul>
    <li v-for="line in lines" :key="line.id" data-testid="line">
      <span data-testid="line-name">{{ line.name }}</span>
      <input
        type="number"
        data-testid="qty"
        :value="line.qty"
        @input="cart.setQty(line.id, Number(($event.target as HTMLInputElement).value))"
      />
      <button data-testid="remove" @click="cart.remove(line.id)">Remove</button>
    </li>
  </ul>
  <form data-testid="discount-form" @submit.prevent="apply">
    <input v-model="code" data-testid="discount" placeholder="Discount code" />
    <button>Apply</button>
  </form>
  <p v-if="discountError" data-testid="discount-error">{{ discountError }}</p>
  <p data-testid="subtotal">{{ subtotal.toFixed(2) }}</p>
  <p data-testid="discount-amount">{{ discount.toFixed(2) }}</p>
  <p data-testid="total">{{ total.toFixed(2) }}</p>
  <button data-testid="clear" @click="cart.clear()">Clear</button>
</template>
