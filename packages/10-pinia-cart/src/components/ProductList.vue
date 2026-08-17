<script setup lang="ts">
import { products } from '../data/products'
import { useCartStore } from '../stores/cart'

// The store instance is shared: this component and CartSummary see the same state.
const cart = useCartStore()
</script>
<template>
  <ul>
    <li v-for="product in products" :key="product.id" data-testid="product">
      <span>{{ product.name }} — {{ product.price }}</span>
      <button data-testid="add" @click="cart.add(product)">Add</button>
    </li>
  </ul>
</template>
