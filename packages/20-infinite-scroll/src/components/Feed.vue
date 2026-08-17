<script setup lang="ts">
import { onMounted } from 'vue'
import { fetchPosts, PAGE_SIZE, type Post } from '../api/feed'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'

const { items, loading, done, error, loadMore } = useInfiniteScroll<Post>(fetchPosts, PAGE_SIZE)

onMounted(loadMore)

function onScroll(event: Event): void {
  // TODO: load the next page once the container is scrolled within 100px of its
  // bottom. The composable already refuses overlapping calls — do not duplicate
  // that logic here.
  void event
}
</script>

<template>
  <div class="feed" data-testid="feed" @scroll="onScroll">
    <ul>
      <li v-for="post in items" :key="post.id" data-testid="post">{{ post.title }}</li>
    </ul>

    <!-- TODO: show these only in the state they belong to -->
    <p data-testid="loading">Loading…</p>
    <p data-testid="error" role="alert">{{ error }}</p>
    <p data-testid="done">That's everything.</p>
    <button type="button" data-testid="more" @click="loadMore">Load more</button>
  </div>
</template>
