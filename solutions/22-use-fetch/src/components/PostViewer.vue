<script setup lang="ts">
import { fetchPost, type Post } from '../api/posts'
import { useFetch } from '../composables/useFetch'

const { data, loading, error, load, retry } = useFetch<Post>(fetchPost)
const ids = ['1', '2', '404']
</script>

<template>
  <div>
    <button
      v-for="id in ids"
      :key="id"
      type="button"
      :data-testid="`load-${id}`"
      @click="load(id)"
    >
      Post {{ id }}
    </button>

    <p v-if="loading" data-testid="loading">Loading…</p>
    <template v-else-if="error">
      <p data-testid="error" role="alert">{{ error }}</p>
      <button type="button" data-testid="retry" @click="retry">Retry</button>
    </template>
    <p v-else-if="data" data-testid="title">{{ data.title }}</p>
  </div>
</template>
