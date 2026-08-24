# Lesson 09 — Why `/users/2` doesn't re-run your `setup()`

> Prep for Exercise 09. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

It's natural to assume that navigating to a new URL creates a fresh
component, the way loading a new page would in a plain multi-page site. Vue
Router doesn't work that way for good reason — recreating a whole component
subtree on every navigation would discard scroll position, transition
state, and any local UI state that has nothing to do with the URL. But that
optimization has a sharp edge: when two different URLs match the *same*
route record and only a param differs, Router reuses the existing component
instance rather than mounting a new one — which means anything read from the
route's params outside a reactive context only sees the value from the
*first* time that component was mounted.

## The main idea

A detail view for a route like `/articles/:slug` might reasonably try this:

```vue
<!-- ArticleDetail.vue — DOES NOT WORK across navigations -->
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = route.params.slug as string
</script>

<template>
  <h1>Article: {{ slug }}</h1>
</template>
```

Navigate directly to `/articles/intro` and this renders `Article: intro`,
correctly. Then click a link to `/articles/setup` from within the same
view — and the heading keeps reading `Article: intro`. `/articles/:slug`
matched both URLs against the exact same route record, so Vue Router reused
the mounted `ArticleDetail` instance instead of destroying and remounting
it. `<script setup>`'s top-level code — including
`const slug = route.params.slug as string` — runs exactly once, at mount
time. Reusing the instance means that line never runs again, so `slug`
stays frozen at whatever it captured the first time, even though
`route.params.slug` itself has since changed.

The fix is to never capture a plain, non-reactive copy of a route param —
derive from `route.params` inside a `computed` instead, so it's read fresh
every time the underlying reactive route object changes:

```vue
<!-- ArticleDetail.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
</script>

<template>
  <h1>Article: {{ slug }}</h1>
</template>
```

`route` itself is reactive — Vue Router updates it in place on every
navigation, it doesn't hand out a new object. A `computed` reading
`route.params.slug` re-evaluates whenever that reactive value changes, param
navigation included, so the heading tracks the current URL correctly no
matter how many times the same route record is reused. The same rule applies
to anything derived from the param — a `watch(() => route.params.slug, ...)`
to re-fetch data when the slug changes is the same fix, for logic that needs
to run a side effect rather than produce a displayed value.

## You'll also meet

**Route guards and `meta`.** A route can declare a `beforeEnter` guard that
runs before Router commits to navigating there, and arbitrary data on
`meta` that the guard (or any component) can read:

```ts
{
  path: '/admin',
  name: 'admin',
  component: AdminView,
  meta: { requiresAuth: true },
  beforeEnter: (to) => {
    if (!isLoggedIn()) return { name: 'login' }
  },
}
```

Returning a route location from a guard redirects there instead of
completing the original navigation; returning nothing (or `true`) lets it
proceed. `meta` is plain data attached to the route record — a natural place
to declare per-route flags a guard or a layout component reads, rather than
hard-coding route names into `if` checks scattered across the app.

**Lazy route components.** A route's `component` can be a function returning
a dynamic import instead of the component itself:

```ts
{ path: '/admin', name: 'admin', component: () => import('./AdminView.vue') }
```

Router only evaluates that import the first time the route is actually
visited, splitting `AdminView` into its own chunk that loads on demand
instead of bloating the app's initial bundle with a view most visitors never
open.

**Injectable history for tests.** `createRouter({ history: createWebHistory(), routes })`
hard-codes browser history, which needs a real browser to test against.
Accepting the history as a parameter —
`function createAppRouter(history = createWebHistory()) { return createRouter({ history, routes }) }`
— lets a test pass `createMemoryHistory()` instead, giving each test an
isolated, in-memory router with no `window.location` involved at all.

## Reference

→ `docs/PATTERNS.md` § "Route params that actually update"
→ Earlier lessons: none — Lesson 09 owns route params with component reuse,
  and route guards & meta

## Now do Exercise 09
