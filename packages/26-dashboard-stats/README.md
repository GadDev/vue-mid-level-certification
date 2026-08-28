# Exercise 26 — Dashboard Stats

**Time limit: 30 min** · Skills: store getters as derivations, defensive parsing, rounding, load states

> **Before you start:** read [Lesson 26 — Trusting nothing on the way in](../../docs/lessons/26-dashboard-stats.md).

## What you're building

A dashboard that summarizes a batch of numeric readings — average, max, min — from an API response you can't fully trust, without letting bad entries crash the figures.

## Prompt

A store that receives API data and derives the figures a dashboard shows.

```ts
useStatsStore(): {
  readings: Ref<Reading[]>
  loading, error, count
  average: ComputedRef<number>        // rounded to 2 decimals, 0 when empty
  max: ComputedRef<Reading | null>
  min: ComputedRef<Reading | null>
  setData(raw: unknown[]): void
  load(): Promise<void>
  reset(): void
}
```

## Requirements

- `setData` takes **`unknown[]`** — the payload is untrusted. Keep only objects with a numeric `id`, a string `label` and a **finite** numeric `value`; `'n/a'`, `NaN`, `Infinity`, `null` and half-built objects are dropped.
- `average` rounds to two decimals **in the getter**, and is `0` for an empty set.
- `max`/`min` return the whole `Reading` (so the label is available), `null` when empty, and keep the **first** of equal extremes.
- Negative values work.
- `load()` flips `loading`, feeds `setData`, sets `LOAD_ERROR` on failure, and clears the error on the next success.
- `reset()` empties everything.
- `StatsPanel.vue` shows exactly one state: loading, error, empty, or the figures.

## DOM contract

| Selector                    | Meaning                              |
| --------------------------- | ------------------------------------ |
| `[data-testid="loading"]`   | while the request runs                |
| `[data-testid="error"]`     | after a failure                       |
| `[data-testid="empty"]`     | loaded, but nothing usable            |
| `[data-testid="average"]`   | the rounded average                   |
| `[data-testid="max"]` / `[data-testid="min"]` | the extreme readings' labels |
| `[data-testid="count"]`     | how many readings survived            |

## Hidden edge cases

Junk in the payload, ties on max/min, negatives, `18.33` rounding, an empty result after a successful load, and a failure followed by a success.

## Run

```bash
pnpm dev:26
pnpm --filter 26-dashboard-stats test
pnpm --filter 26-dashboard-stats typecheck
```

A type predicate (`entry is Reading`) turns the filter into the thing that gives TypeScript the narrowed array — no cast needed afterwards.
