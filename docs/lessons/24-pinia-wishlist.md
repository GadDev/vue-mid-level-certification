# Lesson 24 — Getters that take an argument

> Prep for Exercise 24. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A [Pinia getter](./10-pinia-cart.md) is a `computed` — it takes no
arguments, because a `computed` is just a value that recomputes when its
dependencies change. That's fine for "the total number of bookmarked
articles." It stops being enough for "is *this specific* article
bookmarked" when every row in a list needs to ask that same question with a
different id — a `computed` can't be parameterized per call site, but each
row genuinely needs a different answer.

![Lesson 24 — Getters that take an argument](../assets/lesson_24.png)

## The main idea

Reaching directly into the store's raw state from every row works, but
duplicates the lookup logic everywhere it's needed:

```vue
<script setup lang="ts">
import { useBookmarksStore } from '../stores/bookmarks'

const store = useBookmarksStore()
defineProps<{ articleId: number }>()
</script>

<template>
  <!-- every consumer re-writes the same '.includes()' check -->
  <button :aria-pressed="store.ids.includes(articleId)">★</button>
</template>
```

This works, but `store.ids.includes(articleId)` is store-internal knowledge
— *how* "is bookmarked" is determined — leaking into every component that
needs the answer. If the check ever needs to change (say, bookmarks move
from an array to a `Set` for faster lookups), every one of these call sites
has to be found and updated, because none of them go through the store's
own API for this.

A Pinia getter that **returns a function** keeps that logic in exactly one
place, in the store, while still letting each caller supply its own id:

```ts
// stores/bookmarks.ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useBookmarksStore = defineStore('bookmarks', () => {
  const ids = ref<number[]>([])

  const isBookmarked = computed(() => {
    const idSet = new Set(ids.value)
    return (id: number) => idSet.has(id)
  })

  function toggle(id: number) {
    if (ids.value.includes(id)) {
      ids.value = ids.value.filter(existing => existing !== id)
    } else {
      ids.value.push(id)
    }
  }

  return { ids, isBookmarked, toggle }
})
```

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useBookmarksStore } from '../stores/bookmarks'

const store = useBookmarksStore()
const { isBookmarked } = storeToRefs(store)
defineProps<{ articleId: number }>()
</script>

<template>
  <button :aria-pressed="isBookmarked(articleId)">★</button>
</template>
```

`isBookmarked` is still a single `computed` — it recomputes once when `ids`
changes, not once per row — but what it *produces* is a function, not a
boolean. Every row calls that same function with its own `articleId`, so
the lookup logic (here, a `Set` built once per recomputation rather than a
fresh `.includes()` scan per row) lives in the store and stays there no
matter how many components ask the same question. `storeToRefs` still
applies exactly as in [Lesson 10](./10-pinia-cart.md): destructuring
`isBookmarked` off the plain store object would lose its reactive link, so
it goes through `storeToRefs` like any other getter.

This same store also needs to survive being persisted and reloaded from
`localStorage` — for deep-watch persistence of nested state, see
[Lesson 12](./12-composable-storage.md), and for validating whatever comes
back out of storage before trusting it, see
[Lesson 26](./26-dashboard-stats.md), which owns defensive parsing in full.

## Reference

→ `docs/PATTERNS.md` § "Pinia setup stores"
→ Earlier lessons: [Lesson 10](./10-pinia-cart.md) for setup stores and
  `storeToRefs`, [Lesson 12](./12-composable-storage.md) for deep `watch`

## Sources

- Pinia official docs — [Getters](https://pinia.vuejs.org/core-concepts/getters.html)
- Pinia official docs — [`storeToRefs()`](https://pinia.vuejs.org/core-concepts/index.html#using-the-store)
- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- Vue.js official docs — [Reactivity Fundamentals: destructuring reactive state](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive-proxy-vs-original)
- Anthony Fu — [Pinia design philosophy and setup stores](https://antfu.me) (Pinia core team member on the setup-store pattern used throughout this lesson)
- VueUse docs — [`createGlobalState`](https://vueuse.org/core/createGlobalState/) (a related pattern for parameterized, memoized derived state outside a component)

## Now do Exercise 24

<a href="https://github.com/GadDev/vue-mid-level-certification/tree/main/packages/24-pinia-wishlist" target="_blank">Open exercise on GitHub</a>
