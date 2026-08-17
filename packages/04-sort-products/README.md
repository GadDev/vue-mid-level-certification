# Exercise 04 — Sort Products

**Time limit: 15 min** · Skills: computed with multiple dependencies, immutability, comparator design

## Prompt

Render products in a table. Sort by **name, price or rating**, ascending or descending, using a `computed` list.

The data lives in `src/data/products.ts` as a **shared reactive `ref`**. Never mutate it: `Array.prototype.sort` sorts in place, so a naive `products.value.sort(...)` inside a computed reorders the source that every other consumer sees — and mutating a dependency from inside a computed is exactly the side-effect bug this exercise is about.

TypeScript: use the exported `Product` type and union types for the two controls (`'name' | 'price' | 'rating'`, `'asc' | 'desc'`).

## DOM contract

| Selector                        | Meaning                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `[data-testid="sort-by"]`       | `<select>` bound to the sort key                           |
| `[data-testid="toggle"]`        | direction button, exposes `data-direction="asc" \| "desc"` |
| `[data-testid="row"]`           | one `<tr>` per product, in sorted order                    |
| `[data-testid="name"]`          | name cell                                                  |
| `[data-testid="price"]`         | price cell                                                 |
| `[data-testid="rating"]`        | rating cell                                                |

## Requirements

- Default: name, ascending.
- Numbers sort numerically, not lexicographically (`1200` after `700`).
- Ties are deterministic: equal values fall back to ascending `id` in **both** directions — the
  fallback is *not* flipped by the direction toggle. The specs only observe this ascending, so a
  comparator that multiplies the `id` fallback by the direction factor still goes green. Getting
  it right here is on you, not on the suite.
- The source array's order is unchanged after any amount of sorting.
- Pushing a product into the source ref updates the table on the next tick.

## Hidden edge cases

Numeric vs string comparison, direction toggling back and forth, two products with the same price and the same rating (the specs pin the ascending tie order only), and source-array integrity.

Note that `never mutates the source array` is a **negative** test: it is green on the untouched starter and only ever catches you out. It can't guide you to the answer, which is why the immutability rule is spelled out in the prompt above rather than left to be discovered.

## Run

```bash
pnpm dev:04
pnpm --filter 04-sort-products test      # 9 tests, red until you implement
pnpm --filter 04-sort-products typecheck
```
