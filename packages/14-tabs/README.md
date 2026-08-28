# Exercise 14 — Dynamic Tabs

**Time limit: 25 min** · Skills: derived selection, `watch` on props, list refresh, ARIA state

> **Before you start:** read [Lesson 14 — When the list changes under the selection](../../docs/lessons/14-tabs.md).

## Prompt

`Tabs.vue` renders a tab strip from a list that can change at runtime — a re-fetch can bring new tab objects, a re-order, or an appended tab, and the user's selection has to survive all of it rather than silently resetting to the first tab.

Each tab is `{ id: string; label: string; content: string }` — `label` renders on the button, `content` in the panel.

```ts
defineProps<{ tabs: Tab[] }>()
defineEmits<{ change: [id: string | null] }>()
```

## Requirements

- The first tab is selected on mount; its content shows in the panel.
- Clicking a tab selects it. Clicking the already-selected tab changes nothing and emits nothing.
- The active tab carries `aria-selected="true"` and the `active` class.
- **A data refresh keeps the selection.** New objects with the same ids, a re-order, or appended tabs must not reset the user's choice.
- If the selected tab is gone from the new list, fall back to the first one — or to nothing when the list is empty.
- With no tabs: no panel in the DOM, and the empty state instead.

## DOM contract

| Selector                  | Meaning                                            |
| ------------------------- | -------------------------------------------------- |
| `[role="tab"]`            | every tab button, in list order                     |
| `[data-testid="tab-<id>"]` | one tab button; `.active` + `aria-selected` when selected (e.g. `tab-specs`) |
| `[data-testid="panel"]`   | the selected tab's content — absent when there is none |
| `[data-testid="empty"]`   | shown only when `tabs` is empty                     |

## Hidden edge cases

Refreshed content on the still-selected tab, and recovering from empty back to a selected first tab.

## Traps

Store the **id**, never the index or the tab object — that is what survives a refetch.

## Run

```bash
pnpm dev:14
pnpm --filter 14-tabs test
pnpm --filter 14-tabs typecheck
```
