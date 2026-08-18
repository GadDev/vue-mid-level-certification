---
title: Blog
---

<script setup lang="ts">
import { withBase } from 'vitepress'
import { data as posts } from './index.data.mts'
</script>

# Blog

A running log of what's changing around Vue, written for people already building with it. Two
kinds of posts live here:

- **Vue & ecosystem news** — Vue core releases, and the tools built around it (Vite, Pinia, Vue
  Router, Nuxt, Vitest, VueUse, and similar) — what changed, why it matters, and what it means
  for existing code.
- **Generative AI meets Vue** — AI-assisted dev tools, component generators, and agent
  frameworks that target Vue codebases, covered from the angle of "does this actually help you
  ship Vue, and how."

<ul class="post-list">
  <li v-for="post in posts" :key="post.url" class="post-item">
    <a :href="withBase(post.url)">{{ post.title }}</a>
    <div class="post-meta">
      <time :datetime="post.date">{{ post.date }}</time>
      <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
    </div>
    <p>{{ post.summary }}</p>
  </li>
</ul>

<style scoped>
.post-list {
  list-style: none;
  padding: 0;
}
.post-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.post-meta {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 0.25rem 0 0.5rem;
}
.post-tag {
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: var(--vp-c-default-soft);
}
</style>
