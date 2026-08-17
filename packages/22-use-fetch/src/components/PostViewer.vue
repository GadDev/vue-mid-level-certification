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

    <!-- TODO: exactly one of these states at a time -->
    <p data-testid="loading">Loading…</p>
    <p data-testid="error" role="alert">{{ error }}</p>
    <button type="button" data-testid="retry" @click="retry">Retry</button>
    <p data-testid="title">{{ data?.title }}</p>
  </div>
</template>
