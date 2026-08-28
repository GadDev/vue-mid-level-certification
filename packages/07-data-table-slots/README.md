# Exercise 07 — Data Table with Slots

**Time limit: 35 min** · Skills: named slots, scoped slots, slot fallbacks, `defineSlots`, generic components

> **Before you start:** read [Lesson 07 — Letting the caller decide what renders](../../docs/lessons/07-data-table-slots.md).

## What you're building

A generic table component where the caller decides what every part looks like — header cells, row cells, the empty state, the footer — while the table itself only owns the loop.

## Prompt

**`DataTable.vue`** is a generic presentational table (`<script setup lang="ts" generic="T extends { id: number | string }">`). It owns the loop; the consumer owns the cells. Implement its slot contract and declare it with `defineSlots`:

| Slot     | Kind    | Exposes            | Fallback                          |
| -------- | ------- | ------------------ | --------------------------------- |
| `header` | named   | —                  | `<th>Item</th>`                   |
| `row`    | scoped  | `{ item, index }`  | one cell with `item.id`           |
| `empty`  | named   | —                  | the text `No data.`               |
| `footer` | scoped  | `{ count }`        | `{{ count }} rows`                |

Also: render `<caption>` only when the `caption` prop is given, and render the empty row **only** when `items` is empty.

**`EmployeeTable.vue`** consumes it and fills every slot — three header cells, its own row cells, a custom empty message and a footer using the exposed `count` plus its own payroll total.

## DOM contract

| Selector                          | Meaning                                        |
| --------------------------------- | ---------------------------------------------- |
| `[data-testid="table"]`           | the table root                                  |
| `[data-testid="caption"]`         | only when `caption` is passed                   |
| `[data-testid="header-row"]`      | the `<tr>` inside `<thead>`                     |
| `[data-testid="row"]`             | one `<tr>` per item                             |
| `[data-testid="fallback-cell"]`   | the row slot's default cell                     |
| `[data-testid="empty-row"]`       | only when there are no items                    |
| `[data-testid="cell-index"]`      | EmployeeTable: 1-based row number               |
| `[data-testid="cell-name"]`       | EmployeeTable: employee name                     |
| `[data-testid="cell-role"]`       | EmployeeTable: employee role                     |
| `[data-testid="custom-empty"]`    | EmployeeTable's empty message                    |
| `[data-testid="custom-footer"]`   | EmployeeTable's footer (count + payroll)         |
| `[data-testid="toggle"]`          | EmployeeTable: empties / restores the rows       |

## Traps

- A scoped slot must **not** render when the consumer supplies content — the fallback cell disappearing is asserted.
- `index` is the slot's 0-based index; the consumer renders `index + 1`.
- The empty state and the footer both have to react to the list becoming empty and filling again.
- Keep the `:key="item.id"` on the row: the tests change the list and check the surviving row.

## Run

```bash
pnpm dev:07
pnpm --filter 07-data-table-slots test      # 17 tests (10 table + 7 consumer)
pnpm --filter 07-data-table-slots typecheck
```
