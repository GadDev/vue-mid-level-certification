<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { products } from '../data/products'
import { useWishlistStore } from '../stores/wishlist'

const wishlist = useWishlistStore()
// Destructuring the store would snapshot these; storeToRefs keeps them reactive.
const { count, isFavorite } = storeToRefs(wishlist)
</script>

<template>
  <div>
    <p data-testid="count">{{ count }}</p>
    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.name }}
        <button
          type="button"
          :data-testid="`fav-${product.id}`"
          :aria-pressed="isFavorite(product.id)"
          @click="wishlist.toggle(product.id)"
        >
          ♥
        </button>
      </li>
    </ul>
    <button type="button" data-testid="clear" @click="wishlist.clear">Clear</button>
  </div>
</template>
