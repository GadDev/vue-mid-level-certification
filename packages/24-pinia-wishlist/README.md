# Exercise 24 — Pinia Wishlist

**Time limit: 35 min** · Skills: setup store, getter returning a function, deep `watch` persistence, corrupt-input guards

> **Before you start:** read [Lesson 24 — Getters that take an argument](../../docs/lessons/24-pinia-wishlist.md).

## Prompt

A wishlist you can toggle from anywhere, persisted to `localStorage`.

```ts
useWishlistStore(): {
  ids: Ref<number[]>
  count: ComputedRef<number>
  items: ComputedRef<Product[]>
  isFavorite: ComputedRef<(id: number) => boolean>
  toggle(id: number): void
  remove(id: number): void
  clear(): void
}
```

## Requirements

- `toggle` adds a missing id and removes a present one. An id no product has is ignored.
- `items` resolves the ids to products **in the order they were added**.
- `isFavorite` is a getter that returns a function — `isFavorite(3)`, computed once, called per row.
- Every change is persisted under `STORAGE_KEY`, including an empty list after `clear()`.
- The store hydrates from storage when it is created.
- Storage is hostile: guard `window.localStorage` itself, survive corrupt JSON, a non-array value, and entries that are not numbers. A write that throws (quota, read-only) must not break the store.
- No module-level state — the store is a singleton **per pinia instance**.
- The component reads `count`/`isFavorite` through `storeToRefs` and calls actions off the store.

## DOM contract

| Selector                    | Meaning                                          |
| --------------------------- | ------------------------------------------------ |
| `[data-testid="count"]`     | number of favourites                              |
| `[data-testid="fav-<id>"]`  | toggle button; `aria-pressed` reflects the state   |
| `[data-testid="clear"]`     | empties the wishlist                              |

## Hidden edge cases

`'{not json'` in storage, `{ ids: [1] }` instead of an array, mixed-type entries, a throwing `setItem`, an unknown product id, and a second pinia instance.

## Run

```bash
pnpm dev:24
pnpm --filter 24-pinia-wishlist test
pnpm --filter 24-pinia-wishlist typecheck
```

This package ships a `vitest.setup.ts` that installs an in-memory `Storage`, because this jsdom build does not expose one — your store must still guard the API itself.
