---
title: Blog
---

<script setup lang="ts">
import { data as posts } from './index.data.mts'
</script>

# Blog

Commentary on Vue core and ecosystem releases, tooling changes (Vite, Pinia, Vue Router, Nuxt,
Vitest, VueUse, and similar), and AI tooling relevant to Vue development — component generators,
AI-assisted dev tools, agent frameworks that target Vue codebases. Posts are dated; read older
ones as "true as of that date," not as the current state of the ecosystem.

**Out of scope:** this repo's own releases. Those are tracked in
[`meta/release/CHANGELOG.md`](../../meta/release/CHANGELOG.md), not here.

New posts are added as dated Markdown files under `docs/blog/` (`YYYY-MM-DD-slug.md`) — adding
the file is the only step needed for a post to appear below.

<ul class="post-list">
  <li v-for="post in posts" :key="post.url" class="post-item">
    <a :href="post.url">{{ post.title }}</a>
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
