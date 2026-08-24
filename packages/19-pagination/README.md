# Exercise 19 — Pagination

**Time limit: 30 min** · Skills: generic composable, derived clamping, page-size reset, disabled controls

> **Before you start:** read [Lesson 19 — Clamping is a derivation, not an assignment](../../docs/lessons/19-pagination.md).

## Prompt

100 users, 10 per page. All the arithmetic lives in a generic composable:

```ts
usePagination<T>(source: Ref<T[]>, initialSize = 10): {
  page, pageSize, pageCount, pageItems, isFirst, isLast   // all ComputedRef
  goTo(page: number): void
  next(): void
  prev(): void
  setPageSize(size: number): void
}
```

## Requirements

- Pages are **1-based**. `pageCount` is `ceil(total / pageSize)` — and never less than 1.
- `pageItems` is the slice for the current page; the last page may be short.
- `next`/`prev`/`goTo` clamp to `1…pageCount`. `goTo` ignores anything that is not a whole number.
- **Changing the page size resets to page 1** — page 7 of 10-per-page means nothing at 50-per-page.
- `setPageSize` ignores a size below 1.
- If the source shrinks below the current page, report the new last page instead of an empty one.
- An empty source is page 1 of 1 with no items — `isFirst` and `isLast` both true.
- In the table: `prev` is disabled on the first page, `next` on the last.

## DOM contract

| Selector                  | Meaning                          |
| ------------------------- | -------------------------------- |
| `[data-testid="row"]`     | one row of the current page       |
| `[data-testid="status"]`  | exactly `Page {page} of {count}`  |
| `[data-testid="prev"]` / `[data-testid="next"]` | paging buttons, `disabled` at the ends |
| `[data-testid="size"]`    | the page-size `<select>`          |

## Hidden edge cases

`goTo(2.5)` / `goTo(NaN)`, a shrinking source under the current page, a short last page, an empty source, and the page-size reset.

## Run

```bash
pnpm dev:19
pnpm --filter 19-pagination test
pnpm --filter 19-pagination typecheck
```

Clamp on **read** (a `computed`) rather than writing the clamped page back — otherwise a source that changes size has to remember to fix the stored page.
