<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { products } from '../data/products'
import { useWishlistStore } from '../stores/wishlist'

const wishlist = useWishlistStore()
const { count, isFavorite } = storeToRefs(wishlist)
</script>

<template>
  <div>
    <p data-testid="count">{{ count }}</p>
    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.name }}
        <!-- TODO: the button reflects and toggles the favourite state -->
        <button type="button" :data-testid="`fav-${product.id}`" aria-pressed="false">♥</button>
      </li>
    </ul>
    <button type="button" data-testid="clear" @click="wishlist.clear">Clear</button>
  </div>
</template>
