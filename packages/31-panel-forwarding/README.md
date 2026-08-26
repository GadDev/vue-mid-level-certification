# Exercise 31 — Panel Forwarding

**Time limit: 35 min** · Skills: `$slots`, dynamic slot names, slot forwarding, `$attrs` passthrough, `inheritAttrs`

> **Before you start:** read [Lesson 31 — A wrapper that doesn't know what it wraps](../../docs/lessons/31-panel-forwarding.md).

## Prompt

**`DataPanel.vue`** is already fully implemented — a generic list panel (`<script setup lang="ts" generic="T extends { id: number | string }">`) with a `header` named slot, an `item` scoped slot (`{ item, index }`), an `empty` named slot and a `footer` scoped slot (`{ count }`). You will not edit it.

**`PanelFrame.vue`** wraps `DataPanel` to add its own chrome — a `title` prop rendered as a heading — but otherwise must behave as if it weren't there:

- Every prop a consumer passes other than `title` (e.g. `items`) must reach `DataPanel`, not leak onto `PanelFrame`'s own root element.
- Every slot a consumer gives `PanelFrame` — named or scoped, and whatever it's called — must reach the matching slot on `DataPanel`, with the same slot props intact. `PanelFrame` must not hardcode the four slot names; it doesn't know them.
- A slot the consumer never supplies must still fall back to `DataPanel`'s own default content (forwarding an empty slot is not the same as not forwarding it at all).

**`TaskPanel.vue`** consumes `PanelFrame` and fills every forwarded slot with its own task-list markup, the same way `EmployeeTable` filled `DataTable` in Exercise 07 — except now there's a wrapper in between that isn't allowed to know what's being forwarded.

## DOM contract

| Selector                       | Meaning                                                  |
| ------------------------------- | --------------------------------------------------------- |
| `[data-testid="panel-frame"]`   | `PanelFrame`'s own root element                            |
| `[data-testid="panel-frame-title"]` | `PanelFrame`'s own `title` heading                     |
| `[data-testid="panel-header"]` | `DataPanel`'s header slot output (forwarded from `PanelFrame`) |
| `[data-testid="item-row"]`     | one row per item, from `DataPanel`                         |
| `[data-testid="fallback-item"]` | `DataPanel`'s default cell for the `item` slot            |
| `[data-testid="empty-state"]`  | `DataPanel`'s wrapper around the `empty` slot              |
| `[data-testid="panel-footer"]` | `DataPanel`'s footer slot output (forwarded from `PanelFrame`) |
| `[data-testid="toggle"]`       | `TaskPanel`: empties / restores the task list              |
| `[data-testid="cell-index"]`   | `TaskPanel`: 1-based row number                            |
| `[data-testid="cell-label"]`   | `TaskPanel`: task label                                    |
| `[data-testid="cell-done"]`    | `TaskPanel`: `"Yes"` / `"No"` per task                     |
| `[data-testid="custom-empty"]` | `TaskPanel`'s empty message                                |
| `[data-testid="custom-footer"]`| `TaskPanel`'s footer (count + done count)                  |

## Traps

- Turning off `inheritAttrs` without also binding `$attrs` onto `DataPanel` means `items` disappears entirely — a prop `PanelFrame` never declared has nowhere else to go.
- `v-for="(_, name) in $slots"` only iterates slots the consumer actually supplied — that's what makes an unsupplied slot fall through to `DataPanel`'s own default. Rendering a `<template #name>` for every possible name (whether supplied or not) would silently swallow every fallback.
- A forwarded scoped slot must pass through the exact same params it received — don't rename or drop `item`/`index`/`count` along the way.
- `EmployeeTable`'s pattern from Exercise 07 doesn't change here — `TaskPanel` still consumes named + scoped slots normally. What's new is that `PanelFrame` sits in between and must stay generic.

## Run

```bash
pnpm dev:31
pnpm --filter 31-panel-forwarding test      # 18 tests (9 PanelFrame + 9 TaskPanel)
pnpm --filter 31-panel-forwarding typecheck
```
