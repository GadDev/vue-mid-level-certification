# Lesson 27 — The URL is the state

> Prep for Exercise 27. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A filter and sort UI has an obvious place to keep its own state: a `ref` per
control. That works until a deep link, a bookmark, or the browser's back
button needs to reproduce exactly the same filtered view — none of which
can restore a component-local `ref`, but all of which can restore a URL's
query string. Once the URL has to be the source of truth for what's
filtered, keeping a parallel `ref` copy of the same information creates two
places that can disagree, with no clear rule for which one wins.

![Lesson 27 — The URL is the state](../assets/lesson_27.png)

## The main idea

Copying a query value into local state at mount time looks convenient:

```vue
<!-- ArticleList.vue — DOES NOT WORK for later navigations -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const search = ref((route.query.q as string) ?? '')
</script>
```

This is the exact same trap [Lesson 09](./09-router-master-detail.md) covers
for route params: `<script setup>`'s top-level code runs once, at mount. If
navigating to a new URL — clicking a link that changes `?q=...` — reuses the
same component instance rather than remounting it, this line never runs
again, and `search` stays frozen at whatever the query string held the
first time. The back button, a bookmark with different query values, and a
link to a filtered view all fail to update the search box, for the same
underlying reason: a plain `ref` copied from `route.query` once has no
ongoing connection to it.

The fix, again, is to derive rather than copy — read `route.query` fresh
through a `computed` every time it's needed, instead of ever assigning it
into a `ref`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const search = computed(() => {
  const q = route.query.q
  return (Array.isArray(q) ? q[0] : q)?.trim().toLowerCase() ?? ''
})

function setSearch(value: string) {
  router.push({ query: { ...route.query, q: value || undefined } })
}
</script>
```

Two things about normalizing `route.query` are easy to miss the first time:
a query param can be a **single string or an array of strings** — Vue Router
allows a repeated key (`?q=a&q=b`) to arrive as `string[]` — so reading it
safely means always handling both shapes, typically by taking just the
first value. And every value coming out of `route.query` is untrusted user-
supplied text, the same defensive-parsing concern
[Lesson 26](./26-dashboard-stats.md) covers for API payloads: a `page`
param needs `Number(...)` plus a `Number.isFinite` check and a fallback,
because `?page=abc` or `?page=-1` are both things a user (or a bookmark)
can produce that a naive `Number(route.query.page)` would turn into `NaN`
or a value outside any sensible range.

`setSearch` writes `q: value || undefined` rather than `q: value` — passing
`undefined` for a router-push query value **omits that key from the URL
entirely** instead of writing an empty `?q=`. That's what keeps the URL
clean: a value equal to its own default (empty search, the default sort,
page 1) never needs to appear in the address bar at all, so a shared link
without any filters applied stays a plain, short URL rather than one padded
with `?q=&sort=name&page=1` for values that were never actually chosen.

## Reference

→ `docs/PATTERNS.md` § "Route params that actually update"
→ Earlier lessons: [Lesson 09](./09-router-master-detail.md) for deriving
  from reactive route state instead of copying it, [Lesson 26](./26-dashboard-stats.md)
  for defensive parsing of untrusted input

## Sources

- Vue Router official docs — [`useRoute()` and reactive route state](https://router.vuejs.org/guide/advanced/composition-api.html#accessing-the-router-and-current-route-inside-setup)
- Vue Router official docs — [Query params and repeated keys](https://router.vuejs.org/guide/essentials/passing-props.html)
- Vue Router official docs — [`router.push()`](https://router.vuejs.org/api/interfaces/Router.html#push)
- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- MDN — [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) (the underlying web platform mechanism Vue Router's query object is built on)
- Michael Thiessen — [Why you should keep your state in the URL](https://michaelnthiessen.com) (independent Vue educator on treating the URL as source of truth, the core idea of this lesson)

## Now do Exercise 27
