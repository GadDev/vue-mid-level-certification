# Exercise 13 — Accordion

**Time limit: 20 min** · Skills: single-source view state, conditional rendering, typed props & emits, ARIA

> **Before you start:** read [Lesson 13 — One open at a time, by construction](../../docs/lessons/13-accordion.md).

## What you're building

An FAQ-style list of sections — think "Shipping / Returns / Support" on a support page — where opening one section's answer closes whichever was open before, instead of stacking every answer on screen at once.

## Prompt

`Accordion.vue` receives a list of sections and shows one panel at a time: clicking a header reveals that section's body and hides whichever was showing before.

Each section is `{ id: string; title: string; body: string }` — `title` renders in the header, `body` in the panel.

```ts
defineProps<{ sections: AccordionSection[]; defaultOpen?: string | null }>()
defineEmits<{ change: [id: string | null] }>()
```

## Requirements

- Clicking a header opens that section and closes whichever one was open.
- Clicking the header of the **already open** section closes it — nothing is open then.
- Everything starts closed unless `defaultOpen` names a section that exists.
- `aria-expanded` on each header is `"true"` / `"false"` for that section.
- Every state change emits `change` with the newly open id, or `null` when nothing is open.
- The panel must be **absent** from the DOM while closed (`v-if`, not `v-show`).

## DOM contract

| Selector                        | Meaning                                       |
| ------------------------------- | --------------------------------------------- |
| `[data-testid="header-<id>"]`   | the `<button>` toggling that section; text is the title (e.g. `header-shipping`) |
| `[data-testid="panel-<id>"]`    | the body — only in the DOM while open          |

## Hidden edge cases

An empty `sections` array.

## Traps

The whole exercise is one piece of state: the open id. Storing `open: boolean` on each section is the version that breaks "only one at a time".

## Run

```bash
pnpm dev:13
pnpm --filter 13-accordion test
pnpm --filter 13-accordion typecheck
```
