# Exercise 11 — Async Search (watch, debounce, abort, races)

**Time limit: 40 min** · Skills: `watch`, `onWatcherCleanup`, debouncing, `AbortController`, stale-response races, loading/error state

> **Before you start:** read [Lesson 11 — Async work that keeps changing its mind](../../docs/lessons/11-async-search.md).

## Prompt

Implement `useUserSearch(delay = 300)` in `src/composables/useUserSearch.ts`, then render it in `UserSearch.vue`. The composable returns `{ query, results, loading, error }`.

Behaviour:

1. **Trim** the query. An empty or whitespace-only query issues **no request**, clears `results` and `error`, and leaves `loading` false.
2. **Debounce** by `delay` ms — a burst of keystrokes produces exactly **one** call to `searchUsers`, with the latest query.
3. **Abort** the in-flight request when the query changes again: pass an `AbortSignal` to `searchUsers(query, signal)`. `onWatcherCleanup()` is the natural place for both `clearTimeout` and `controller.abort()`.
4. **Ignore stale responses.** An older request that resolves *after* a newer one must not overwrite the newer results. Aborting is not enough — a mocked or non-cooperative API still resolves, so guard with a request ticket.
5. **`loading`** is true from the keystroke until the newest request settles, and never true at the same time as rendered results.
6. **Errors**: a failed request sets `error` to the exported `SEARCH_ERROR`, empties `results`, and stops loading. An **aborted** request is not an error. A later successful search clears the error.
7. Stopping the owning scope (component unmount) cancels pending work — no request fires after unmount.

## DOM contract

| Selector                    | Meaning                                                |
| --------------------------- | ------------------------------------------------------ |
| `[data-testid="search"]`    | the query input (`v-model`)                             |
| `[data-testid="loading"]`   | only while loading                                      |
| `[data-testid="error"]`     | only on error, with `role="alert"`                      |
| `[data-testid="count"]`     | number of results                                       |
| `[data-testid="user"]`      | one per result, name and role                            |
| `[data-testid="empty"]`     | only when a non-empty query returned zero results        |

Exactly one of loading / error / results is visible at a time.

## Traps

- Debounce **before** the request, not after: a `setTimeout` inside the watcher, cleared on the next run.
- `finally { loading.value = false }` without a ticket check turns a late stale response into a spurious "not loading".
- Treating an `AbortError` as a failure shows an error banner on every keystroke.
- Reading `query.value` inside the timeout instead of capturing the trimmed value gives you the *newest* query with the *oldest* request.

## Run

```bash
pnpm dev:11                       # "boom" as a query triggers the error path
pnpm --filter 11-async-search test      # 20 tests (13 composable + 7 component)
pnpm --filter 11-async-search typecheck
```

The tests mock `src/api/users.ts` and drive time with `vi.useFakeTimers()`, so they are deterministic — read them for how to test async Vue code.
