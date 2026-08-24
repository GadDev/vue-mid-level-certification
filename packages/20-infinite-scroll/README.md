# Exercise 20 — Infinite Scroll

**Time limit: 35 min** · Skills: injected loader, in-flight guard, end-of-data detection, error recovery

> **Before you start:** read [Lesson 20 — The second call that shouldn't happen](../../docs/lessons/20-infinite-scroll.md).

## Prompt

A feed that loads 20 posts at a time. The paging logic is a composable that never touches the network itself:

```ts
useInfiniteScroll<T>(loadPage: (page: number) => Promise<T[]>, pageSize = 20): {
  items, loading, done, error, page   // all ComputedRef
  loadMore(): Promise<void>
  reset(): void
}
```

## Requirements

- `loadMore()` requests the **next** page and appends its items in order.
- **No duplicate requests.** A call while one is in flight does nothing, and so does a call once `done`.
- `done` becomes true when a page comes back **shorter than `pageSize`** (an empty page included).
- A failed request sets `error`, keeps the items already loaded, and does **not** advance the page — the next `loadMore()` retries the same page. A success clears `error`.
- `reset()` returns to the empty state so the next call asks for page 1 again.
- `Feed.vue` loads page 1 on mount and calls `loadMore()` when the container is scrolled within 100 px of its bottom. It shows the loading state, the end-of-feed message (with no button left), or the error **plus** a button to retry.

## DOM contract

| Selector                  | Meaning                                        |
| ------------------------- | ---------------------------------------------- |
| `[data-testid="feed"]`    | the scroll container                            |
| `[data-testid="post"]`    | one loaded post                                 |
| `[data-testid="loading"]` | present only while a request is in flight        |
| `[data-testid="error"]`   | present only after a failure                     |
| `[data-testid="done"]`    | present only once everything is loaded           |
| `[data-testid="more"]`    | manual load; gone when `done`                    |

## Hidden edge cases

Two overlapping `loadMore()` calls, a short final page, an empty page, retrying the failed page (not the next one), and a scroll event far from the bottom.

## Run

```bash
pnpm dev:20
pnpm --filter 20-infinite-scroll test
pnpm --filter 20-infinite-scroll typecheck
```

The loader is injected rather than imported so the spec can drive it with hand-resolved promises — the same reason `createAppRouter(history)` takes its history.
