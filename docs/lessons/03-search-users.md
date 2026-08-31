# Lesson 03 — `computed`, and why not a method

> Prep for Exercise 03. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

Filtering a list by a search box looks like it needs nothing more than a
function: take the query, take the list, return the matches. And a plain
method does work — the template can call `filteredBooks()` and it renders
correctly. The problem only shows up once you ask *when* that function
actually runs, because a method call in a template re-runs on every single
re-render of the component, for any reason at all — not just when the
inputs the function actually cares about have changed.

![Lesson 03 — `computed`, and why not a method](../assets/lesson_3.png)

## The main idea

Here filtering is a plain method:

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Book {
  title: string
  author: string
}

const books = ref<Book[]>([
  { title: 'Dune', author: 'Frank Herbert' },
  { title: 'Circe', author: 'Madeline Miller' },
])
const query = ref('')
const tick = ref(0)

function filteredBooks() {
  console.log('filtering ran')
  return books.value.filter(b => b.title.toLowerCase().includes(query.value.trim().toLowerCase()))
}
</script>

<template>
  <input v-model="query" />
  <button @click="tick++">Unrelated re-render ({{ tick }})</button>
  <ul>
    <li v-for="book in filteredBooks()" :key="book.title">{{ book.title }}</li>
  </ul>
</template>
```

Click "Unrelated re-render" and `'filtering ran'` prints again in the
console, even though neither `books` nor `query` changed. Nothing here is
technically wrong — the result is still correct — but the filter recomputes
every time *anything* in the component re-renders, which gets expensive fast
once the list is long or the filter does real work. A method in a template
is indistinguishable, performance-wise, from calling it directly on every
render.

A `computed` fixes this by tracking exactly which reactive values the
function reads, and only re-running when one of those specific values
changes:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

interface Book {
  title: string
  author: string
}

const books = ref<Book[]>([
  { title: 'Dune', author: 'Frank Herbert' },
  { title: 'Circe', author: 'Madeline Miller' },
])
const query = ref('')
const tick = ref(0)

const filteredBooks = computed<Book[]>(() => {
  console.log('filtering ran')
  return books.value.filter(b => b.title.toLowerCase().includes(query.value.trim().toLowerCase()))
})
</script>

<template>
  <input v-model="query" />
  <button @click="tick++">Unrelated re-render ({{ tick }})</button>
  <ul>
    <li v-for="book in filteredBooks" :key="book.title">{{ book.title }}</li>
  </ul>
</template>
```

Two things changed, and both matter: `filteredBooks` is now called without
parentheses in the template — it's a `ComputedRef`, not a function, so `{{
filteredBooks }}` (or `v-for="book in filteredBooks"`) reads its cached
`.value` rather than invoking anything. And clicking "Unrelated re-render"
now prints nothing — Vue saw that the computed only depends on `books` and
`query`, neither of which changed, and returned the cached result instead of
re-running the callback.

That's the interview-ready version of the rule: a method call in a template
runs on every render of that component, unconditionally. A `computed` runs
once, then again only when one of the reactive values it actually read
inside its callback changes — it's a cache with automatic, precise
invalidation, not a scheduled poll.

## Reference

→ `docs/PATTERNS.md` § "Computed Properties for Filtering & Sorting"
→ `docs/PATTERNS.md` § "Form Input Binding with `v-model`"
→ Earlier lessons: none — Lesson 03 owns `computed` as cached derivation

## Sources

- Vue.js official docs — [Computed Properties](https://vuejs.org/guide/essentials/computed.html)
- Vue.js official docs — [Reactivity in Depth: computed and caching](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- Vue.js official docs — [Form Input Bindings: `v-model`](https://vuejs.org/guide/essentials/forms.html)
- Vue School — [Vue 3 Computed Properties](https://vueschool.io/lessons/computed-properties-in-vue-3) (independent Vue course covering the method-vs-computed distinction)
- Anthony Fu — [Reinventing Vue.js Reactivity](https://antfu.me/posts/reinventing-vue-reactivity-in-vueuse) (Vue core-team-adjacent deep dive into how computed caching is implemented under the hood)

## Now do Exercise 03

<a href="https://github.com/GadDev/vue-mid-level-certification/tree/main/packages/03-search-users" target="_blank">Open exercise on GitHub</a>

<MarkComplete id="03" />
