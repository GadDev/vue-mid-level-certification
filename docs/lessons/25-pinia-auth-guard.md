# Lesson 25 — The store knows who; the router decides where

> Prep for Exercise 25. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

Protecting a route needs two things that live in different places: *who is
signed in* (state, naturally owned by a Pinia store) and *where navigation
should be redirected to* (a routing decision, naturally owned by Vue
Router). A route guard is where these two meet — but it isn't a component,
so it can't call `useAuthStore()` the way a component's `<script setup>`
would, at the top level, and expect it to behave the same way.

## The main idea

Calling the store once, when the router module is first evaluated, looks
like the natural place to grab it:

```ts
// router/index.ts — DOES NOT WORK reliably
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore() // captured once, at module load time

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })

  router.beforeEach(to => {
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'login' }
    }
  })

  return router
}
```

In a real running app, this can happen to work — `createPinia()` usually
runs once and stays active for the app's whole lifetime, so `auth` captured
at module load time is the only instance that ever exists. It breaks the
moment more than one Pinia instance is created against the same imported
router module — which is exactly what a test suite does, calling
`setActivePinia(createPinia())` fresh for every test. `useAuthStore()` at
module scope runs once, the first time the module is imported, and binds
`auth` to whichever Pinia instance happened to be active *then* — every
later test's fresh store is invisible to a guard that already captured a
different instance. This is the same module-scope trap
[Lesson 05](./05-counter-history.md) warns against for composables, applied
to a store instead of a `ref`.

The fix is to call `useAuthStore()` **inside** the guard callback itself, so
it always resolves against whichever Pinia instance is active at the moment
navigation actually happens:

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })

  router.beforeEach(to => {
    const auth = useAuthStore() // resolved fresh, every navigation
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'login' }
    }
  })

  return router
}
```

`to.meta.requiresAuth` is how the guard knows *which* routes need this check
at all, without hard-coding route names inside the guard — each route
declares its own requirement as data (`meta: { requiresAuth: true }`), and
one guard reads that data uniformly across every route.

### The redirect round-trip

Redirecting an unauthenticated visitor to a login page loses information
if it doesn't also remember where they were headed:

```ts
router.beforeEach(to => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})
```

```vue
<!-- LoginView.vue -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

async function onSubmit(email: string, password: string) {
  const ok = await auth.login(email, password)
  if (ok) {
    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' ? redirect : '/')
  }
}
</script>
```

The guard stashes the page the visitor was trying to reach in
`query.redirect` before sending them to `/login`; the login view reads that
same query param back out after a successful sign-in and navigates there
instead of always landing on some fixed default. The round-trip only works
because both sides agree on the same query key — the guard writes it, the
login view reads it, and neither would work without the other.

## Reference

→ `docs/PATTERNS.md` § "Route params that actually update"
→ `docs/PATTERNS.md` § "Pinia setup stores"
→ Earlier lessons: [Lesson 09](./09-router-master-detail.md) for route
  guards and `meta`, [Lesson 10](./10-pinia-cart.md) for Pinia setup stores

## Sources

- Vue Router official docs — [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- Vue Router official docs — [Route Meta Fields](https://router.vuejs.org/guide/advanced/meta.html)
- Vue Router official docs — [`beforeEach`](https://router.vuejs.org/api/interfaces/Router.html#beforeEach)
- Pinia official docs — [Using a store outside of a component](https://pinia.vuejs.org/core-concepts/outside-component-usage.html)
- Pinia official docs — [Setup stores](https://pinia.vuejs.org/core-concepts/index.html#setup-stores)
- Vue School — [Vue Router: authentication guards](https://vueschool.io/articles/vuejs-tutorials/vue-router-4-tutorial-navigation-guards/) (independent walkthrough of the redirect-and-return-to pattern covered here)

## Now do Exercise 25
