<script setup lang="ts">
import { onMounted } from 'vue'
import { fetchPosts, PAGE_SIZE, type Post } from '../api/feed'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'

const { items, loading, done, error, loadMore } = useInfiniteScroll<Post>(fetchPosts, PAGE_SIZE)

onMounted(loadMore)

const THRESHOLD = 100

function onScroll(event: Event): void {
  const el = event.target as HTMLElement
  // The composable already refuses overlapping calls, so firing on every
  // scroll tick is safe — no debounce needed to avoid duplicate requests.
  if (el.scrollHeight - el.scrollTop - el.clientHeight <= THRESHOLD) loadMore()
}
</script>

<template>
  <div class="feed" data-testid="feed" @scroll="onScroll">
    <ul>
      <li v-for="post in items" :key="post.id" data-testid="post">{{ post.title }}</li>
    </ul>

    <p v-if="loading" data-testid="loading">Loading…</p>
    <p v-else-if="done" data-testid="done">That's everything.</p>
    <template v-else>
      <!-- A failed page keeps the button around: the error state must be recoverable. -->
      <p v-if="error" data-testid="error" role="alert">{{ error }}</p>
      <button type="button" data-testid="more" @click="loadMore">Load more</button>
    </template>
  </div>
</template>
