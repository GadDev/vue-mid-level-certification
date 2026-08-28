# Exercise 22 — `useFetch()`

**Time limit: 35 min** · Skills: request state machine, per-instance cache, retry semantics, stale responses

> **Before you start:** read [Lesson 22 — The request state machine](../../docs/lessons/22-use-fetch.md).

## What you're building

A data-fetching helper with request state (loading/error/data) and its own cache, used to load one post at a time by id without re-fetching something already in memory.

## Prompt

```ts
useFetch<T>(load: (key: string) => Promise<T>): {
  data, loading, error, key      // all ComputedRef
  load(key: string): Promise<void>
  retry(): Promise<void>
  invalidate(key?: string): void
}
```

The transport is injected — the composable owns state and caching, nothing else.

## Requirements

- `load(key)` requests the key, exposes `loading` while in flight, and stores the result.
- **Cache hits never hit `load`** and never flip `loading` — a key already fetched resolves straight from memory.
- A failure sets `error` (`FETCH_ERROR`), leaves `data` null, and is **not cached**: asking again really asks again. The next success clears `error`.
- `retry()` re-runs the last key **bypassing the cache**, then stores the fresh value. Before anything has been loaded it does nothing.
- `invalidate(key)` drops one entry; `invalidate()` clears the cache.
- Overlapping requests: only the newest one may write to `data`/`error`/`loading` — a slow response for an older key is dropped, success or failure.
- The cache lives in the instance. Two `useFetch()` calls share nothing.

## DOM contract

| Selector                     | Meaning                              |
| ---------------------------- | ------------------------------------ |
| `[data-testid="load-<id>"]`  | requests that post                    |
| `[data-testid="loading"]`    | present only while in flight          |
| `[data-testid="error"]`      | present only after a failure          |
| `[data-testid="retry"]`      | present with the error; re-runs the key |
| `[data-testid="title"]`      | the loaded post's title               |

## Hidden edge cases

A repeated key (call count must not move), an error that is retried, `retry` refreshing the cached value, `invalidate` with and without a key, and two out-of-order responses.

## Run

```bash
pnpm dev:22
pnpm --filter 22-use-fetch test
pnpm --filter 22-use-fetch typecheck
```

The request "ticket" is the same idea as exercise 11: the newest request wins, and a late one must check whether it is still relevant — including in `finally`.
