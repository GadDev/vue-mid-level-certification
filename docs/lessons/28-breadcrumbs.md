# Lesson 28 — Never hand-write a breadcrumb trail

> Prep for Exercise 28. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A breadcrumb trail mirrors the route hierarchy the app already has — Home →
Library → Fiction → this book. Writing that trail by hand on every page
means the trail and the actual route structure are two independent things
that happen to agree today, and quietly drift the moment a route is
renamed, nested differently, or a new page forgets to declare its own
breadcrumb array. The route configuration already encodes the hierarchy the
trail needs to describe; the trail should be generated from it, not
duplicated beside it.

![Lesson 28 — Never hand-write a breadcrumb trail](../assets/lesson_28.png)

## The main idea

Every route can declare `meta.breadcrumb`, a plain label for what that
route represents:

```ts
const routes = [
  {
    path: '/library',
    name: 'library',
    meta: { breadcrumb: 'Library' },
    children: [
      {
        path: ':genre',
        name: 'genre',
        meta: { breadcrumb: route => `${route.params.genre}` },
        children: [
          { path: ':id', name: 'book', meta: { breadcrumb: 'Book' } },
        ],
      },
    ],
  },
]
```

`route.matched` — available on the current route object — is the array of
every route record that matched to produce the current page, **outermost
first**: for `/library/fiction/42`, that's `[library, genre, book]`, in
exactly that order. That ordering is not incidental; it's the same order a
breadcrumb trail reads in, top-level first.

```ts
import { computed } from 'vue'
import { useRoute } from 'vue-router'

function useBreadcrumbs() {
  const route = useRoute()

  return computed(() =>
    route.matched
      .filter(record => record.meta.breadcrumb)
      .map(record => {
        const label = record.meta.breadcrumb
        return typeof label === 'function' ? label(route) : label
      }),
  )
}
```

`.filter(record => record.meta.breadcrumb)` is what skips **layout**
records — a route that groups children under a shared wrapper but isn't
itself a page a user navigates to has no `meta.breadcrumb` set, and is
excluded rather than producing an empty or meaningless crumb. A label can
be a plain string (`'Library'`) or a function of the current route
(`route => route.params.genre`) — the function form is what lets a dynamic
segment like `:genre` produce a label that depends on which genre is
actually being viewed, rather than a fixed placeholder.

### Param interpolation for intermediate links

Every crumb except the last one should link somewhere — but the *route
record's own path* still contains the raw `:genre`/`:id` placeholders, not
the actual values from the current URL. A crumb's link has to substitute
in the real params from the current route, not the record's declared
pattern:

```ts
function pathWithParams(recordPath: string, params: Record<string, string>) {
  return recordPath.replace(/:(\w+)/g, (_, key) => params[key] ?? '')
}
```

Given the current route's `params` (`{ genre: 'fiction', id: '42' }`) and a
matched record's raw path (`/library/:genre`), this produces
`/library/fiction` — the actual, clickable URL for that intermediate level,
built from the same params object the current page itself was reached
through. Without this step, an intermediate crumb's link would point at a
literal, unresolved `:genre` segment instead of a real, navigable path.

## Reference

→ `docs/PATTERNS.md` § "Route params that actually update"
→ Earlier lessons: [Lesson 09](./09-router-master-detail.md) for route
  params and reactive derivation, [Lesson 25](./25-pinia-auth-guard.md)
  for `meta` as a place to attach per-route data

## Sources

- Vue Router official docs — [`route.matched`](https://router.vuejs.org/api/interfaces/RouteLocationNormalizedLoaded.html#matched)
- Vue Router official docs — [Route Meta Fields](https://router.vuejs.org/guide/advanced/meta.html)
- Vue Router official docs — [Nested Routes](https://router.vuejs.org/guide/essentials/nested-routes.html)
- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- Vue School — [Vue Router: building dynamic breadcrumbs from route meta](https://vueschool.io/) (independent walkthrough of generating navigation trails from `route.matched`, the exact pattern taught here)

## Now do Exercise 28
