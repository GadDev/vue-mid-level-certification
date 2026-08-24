# Exercise 27 — Query Filters

**Time limit: 35 min** · Skills: URL as state, `route.query` normalisation, derived filtering, clean URLs

> **Before you start:** read [Lesson 27 — The URL is the state](../../docs/lessons/27-query-filters.md).

## Prompt

A product list whose search, sort and page live in the query string: `?q=an&sort=price&page=2`.

The rule that makes this exercise: **the URL is the only state.** No local `ref` mirroring it — a deep link, the back button and a click on *Next* all take the same path.

## Requirements

- Defaults: `q` empty, `sort` `'name'`, `page` `1`. Those defaults are **left out of the URL**.
- `q` filters on the name, case-insensitively, trimmed. `sort` is `name` (alphabetical) or `price` (ascending); anything else falls back to `name`.
- A query value can be `string | string[]` — take the first.
- `page` ignores non-numeric, zero and negative values (→ 1) and clamps past the end.
- Changing `q` or `sort` **resets the page**; paging keeps the other filters.
- Sorting must not mutate the shared `products` array.
- A navigation that only changes the query re-renders the list — nothing may be frozen at the value `setup()` first saw.

## DOM contract

| Selector                  | Meaning                          |
| ------------------------- | -------------------------------- |
| `[data-testid="q"]`       | the search input                  |
| `[data-testid="sort"]`    | the sort `<select>`               |
| `[data-testid="row"]`     | one product on the current page   |
| `[data-testid="status"]`  | exactly `Page {page} of {count}`  |
| `[data-testid="prev"]` / `[data-testid="next"]` | paging |
| `[data-testid="empty"]`   | shown when nothing matches        |

## Hidden edge cases

`?page=abc`, `?page=0`, `?page=99`, `?sort=colour`, a repeated `?q=le&q=zz`, clearing the search back to a clean URL, and a `router.push` that changes only the query.

## Run

```bash
pnpm dev:27
pnpm --filter 27-query-filters test
pnpm --filter 27-query-filters typecheck
```

Everything is a `computed` over `route.query`. The moment you copy a query value into a `ref`, you own the job of keeping the two in sync — in both directions.
