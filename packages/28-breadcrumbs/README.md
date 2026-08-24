# Exercise 28 — Breadcrumbs

**Time limit: 30 min** · Skills: `route.matched`, route meta, nested routes, param interpolation

> **Before you start:** read [Lesson 28 — Never hand-write a breadcrumb trail](../../docs/lessons/28-breadcrumbs.md).

## Prompt

Generate the breadcrumb trail from the route definitions — no hand-written trail per page.

```ts
useBreadcrumbs(): ComputedRef<Array<{ label: string; path: string; isCurrent: boolean }>>

// meta.breadcrumb is a string, or a function of the current route
meta: { breadcrumb: route => `Item #${route.params.id}` }
```

## Requirements

- The trail always starts at **Home** (`/`) and never repeats it.
- Walk `route.matched`; a record **without** `meta.breadcrumb` (a layout, `/settings`) is skipped.
- A function label is called with the current route; a string label is used as-is.
- Intermediate links get the **params filled in**: on `/products/tools/7` the "Tools" crumb links to `/products/tools`, not `/products/:category`.
- A pathless child (`path: ''`) must not add a duplicate crumb.
- The last crumb is the current page: plain text with `aria-current="page"`, not a link.
- The trail re-derives on navigation, including when only a param changes.

## DOM contract

| Selector                       | Meaning                                        |
| ------------------------------ | ---------------------------------------------- |
| `[data-testid="breadcrumbs"]`  | the `<nav aria-label="Breadcrumb">`             |
| `[data-testid="crumb"]`        | one crumb, in order                             |
| `[data-testid="crumb"] a`      | the linked crumbs only                          |
| `[aria-current="page"]`        | exactly one, on the last crumb                  |

## Hidden edge cases

`/settings` (no meta), the pathless `''` child of `/products`, `:category`/`:id` interpolation, and a navigation that changes only a param.

## Run

```bash
pnpm dev:28
pnpm --filter 28-breadcrumbs test
pnpm --filter 28-breadcrumbs typecheck
```

`route.matched` is the parent chain of the current route, outermost first — which is exactly the breadcrumb order, once you throw away the records that are not pages.
