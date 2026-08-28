# Exercise 01 — Scroll to Item

**Time limit: 25 min** · Skills: template refs, DOM APIs, form validation, `nextTick`

> **Before you start:** read [Lesson 01 — Reaching the real DOM from Vue](../../docs/lessons/01-scroll-to-item.md).

## What you're building

A jump-to-row control for a long list: type a row number, submit, and that row scrolls into view and briefly flashes so you can spot it.

## Prompt

Render 20 items in a fixed-height scrollable list showing about five rows. The user enters a **1-based index** and submits. Use Vue **template refs** and `scrollIntoView()` to jump to the item and highlight it for about one second.

Reject empty, whitespace-only, non-numeric, negative, decimal, zero, and out-of-range values with a visible error message. Do **not** use `document.querySelector`.

Write everything in TypeScript (`<script setup lang="ts">`): type the item shape and the refs you add.

## DOM contract

The test suite is the spec — it drives the component through these hooks:

| Selector                   | Meaning                                              |
| -------------------------- | ---------------------------------------------------- |
| `.item`                    | one per row, 20 total                                |
| `.highlighted`             | class on the currently highlighted row only          |
| `[data-testid="index"]`    | the index input (`v-model`)                          |
| `form`                     | submitting it runs the jump (`@submit.prevent`)      |
| `[role="alert"]`           | rendered **only** while there is a validation error  |

## Requirements

- A valid index highlights exactly one row and calls `scrollIntoView` on that row's element.
- The highlight disappears ~1000 ms after the last valid submission.
- An invalid submission shows the error, clears any highlight, and does not scroll.
- A valid submission clears a previous error.

## Hidden edge cases

Whitespace input (`"  4  "`), submitting the same item twice (the timer must restart, not stack), and rapid submissions (only the last target stays highlighted).

## Run

```bash
pnpm dev:01    # browser
pnpm --filter 01-scroll-to-item test
pnpm --filter 01-scroll-to-item typecheck
```

The tests start **red**. Your job is to make all 16 pass without editing them.
