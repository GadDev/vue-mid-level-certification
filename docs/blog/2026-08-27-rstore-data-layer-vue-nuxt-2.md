---
title: 'rstore: the data layer Pinia never tried to be'
date: '2026-08-27'
tags: [vue, nuxt, ecosystem]
summary: >-
  rstore is a normalized, reactive data store for Vue and Nuxt from Vue Devtools creator
  Guillaume Chau — optimistic mutations, local-first caching, and typed queries so teams stop
  hand-rolling the same fetch-cache-invalidate plumbing around every Pinia store.
readTime: 6
---

# rstore: the data layer Pinia never tried to be

Every Pinia store that fetches data eventually grows the same limbs: a `loading` ref, an `error` ref, some ad hoc dedup so two components don't both fire the same request, and a manual cache invalidation dance after a mutation. None of that is Pinia's fault — it's deliberately a low-level reactive-state primitive, not a data layer — but it means every team ends up hand-rolling the same fetch-cache-mutate plumbing project after project. [rstore](https://rstore.dev/) is a new attempt at closing that gap for Vue and Nuxt specifically, and it comes from a name Vue developers already trust: Guillaume Chau (Akryum), the person behind Vue Devtools and Vue Apollo, building this one under the Directus GitHub org.

## What it actually adds on top of Pinia

rstore's pitch is "build fast, data-heavy UIs without wrestling state management," and the mechanism is a normalized, reactive cache that acts as the single source of truth for your app's data — not a store per feature, but one cache that every query and mutation reads from and writes back into. On top of that sit the pieces you'd otherwise write by hand: local-first reads so the UI renders from cache instantly while a request resolves in the background, optimistic mutations that update the UI before the server confirms, typed query and mutation APIs with autocomplete, and a plugin system for the actual transport — REST, GraphQL, WebSockets, or anything else — so the same query API works regardless of what's on the other end.

That's a meaningfully different job than Pinia's. Pinia gives you `ref`s and `computed`s wired into devtools; it has no opinion on where data comes from or how it's cached. TanStack Query and similar libraries solve the caching half but were designed framework-agnostic first, which shows up in a less Vue-native API. rstore bakes normalization, offline sync, and live subscriptions in as first-class concerns rather than bolted-on plugins, which is the part worth paying attention to if your app does more than fetch-and-display.

## The actual shape of the API

Setup is a package install and a plugin, same as most Vue tooling:

```bash
npm i @rstore/vue
```

```ts
import { createStore, RstorePlugin } from '@rstore/vue'
import { schema } from './schema'

export async function setupRstore(app: App) {
  const store = await createStore({ schema })
  app.use(RstorePlugin, { store })
}
```

A collection is where the interesting design choice lives. Instead of a store module with actions, you define an item type and its hooks:

```ts
import { withItemType } from '@rstore/vue'

interface Todo {
  id: string
  title: string
  completed: boolean
}

const todos = withItemType<Todo>().defineCollection({
  name: 'todos',
  hooks: {
    fetchFirst: ({ key }) => fetch(`/api/todos/${key}`).then(r => r.json()),
    fetchMany: () => fetch('/api/todos').then(r => r.json()),
    create: ({ item }) => fetch('/api/todos', { method: 'POST', body: JSON.stringify(item) }).then(r => r.json()),
    update: ({ key, item }) => fetch(`/api/todos/${key}`, { method: 'PATCH', body: JSON.stringify(item) }).then(r => r.json()),
    delete: ({ key }) => fetch(`/api/todos/${key}`, { method: 'DELETE' }),
  },
})

export const schema = [todos]
```

Every hook is just "how do I talk to my actual backend" — rstore owns the caching, normalization, and reactivity around whatever those functions return. In a component, that collapses to:

```vue
<script setup lang="ts">
import { useStore } from '@rstore/vue'

const store = useStore()
const { data: todos, loading } = await store.todos.query(q => q.many())

async function addTodo() {
  await store.todos.create({ id: crypto.randomUUID(), title: 'Ship the docs', completed: false })
}
</script>
```

`store.todos.create(...)` doesn't just POST and forget — it updates the normalized cache, which means every other component querying `todos` anywhere in the app re-renders with the new item, with no manual invalidation call anywhere in sight.

The query builder itself takes filtering and backend params inline, rather than forcing you to hand-build a query string:

```ts
const { data: todos, loading, refresh } = await store.todos.query(q =>
  q.many({
    filter: item => !item.completed,
    params: { completed: false },
  }),
)
```

`filter` runs client-side against whatever's already in the normalized cache, while `params` gets forwarded to the `fetchMany` hook so the actual backend request can do the filtering server-side too — useful once a collection is too large to reasonably cache in full on the client.

## Where Nuxt makes this genuinely less boilerplate

`@rstore/nuxt` auto-scans `app/rstore` for collection exports and `app/rstore/plugins` for plugin exports, then exposes a fully typed `useStore()` with no manual plugin wiring — the convention-over-configuration move Nuxt users already expect from modules.

The sharper part is `@rstore/nuxt-drizzle`: if your backend schema is already defined in Drizzle, this generates the rstore collection layer — the fetch/create/update/delete hooks above — directly from that schema instead of you writing them by hand. That's the kind of integration that only makes sense once you've written the same five CRUD hooks per table often enough to want it automated.

## Why this is worth watching rather than adopting outright today

A few caveats worth stating plainly rather than glossing over. rstore is still pre-1.0 by its own versioning, and the maintainers explicitly mark some surface area — the AI-assisted skills feature mentioned on the docs site — as experimental. The core query/mutation/cache API looks settled enough to read and reason about, but on a library at this stage, treat any specific hook signature or query-builder method shown here as best-current-understanding against the docs at the time of writing, not a guaranteed-stable contract — check `rstore.dev`'s own guide before wiring it into anything you'd be unhappy to refactor later.

That said, the problem it's aimed at is real and unglamorous: nearly every non-trivial Vue app ends up building an ad hoc version of exactly this — a cache, some optimistic-update logic, and a way to avoid re-fetching data six components already have. Having that come from someone with Chau's track record on Vue tooling, under an org (Directus) that has its own incentive to keep a data layer well-maintained, makes rstore worth a serious look the next time a Pinia store starts sprouting `loading` and `error` refs for the third time in the same codebase.

## Sources

- [rstore](https://rstore.dev/)
- [Getting Started — rstore](https://rstore.dev/guide/getting-started)
- [directus/rstore — GitHub](https://github.com/directus/rstore)
