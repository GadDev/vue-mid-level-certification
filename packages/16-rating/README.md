# Exercise 16 — Rating

**Time limit: 30 min** · Skills: `defineModel`, preview vs committed state, keyboard support, ARIA slider

> **Before you start:** read [Lesson 16 — Two pieces of state that look like one](../../docs/lessons/16-rating.md).

## What you're building

A star-rating control you can operate with a mouse or a keyboard, where hovering previews a value without committing it until you actually click or press a key.

## Prompt

A ★★★★★ rating control that works with the mouse **and** the keyboard.

```ts
const model = defineModel<number>({ default: 0 })
withDefaults(defineProps<{ max?: number; readonly?: boolean }>(), { max: 5, readonly: false })
```

## Requirements

- `max` stars; a star is `filled` when its index is ≤ the displayed value.
- **Hover previews** — filled stars follow the pointer, but nothing is emitted until a click. Leaving the group restores the real value.
- Clicking a star selects it; clicking the **currently selected** star clears the rating to `0`.
- Keyboard on the group: `ArrowRight`/`ArrowUp` +1, `ArrowLeft`/`ArrowDown` −1, `Home` → 0, `End` → `max`, all clamped to `0…max`. Handled keys call `preventDefault()`; other keys are left alone.
- No update is emitted when the value would not change (already at an end of the scale).
- `readonly` disables clicks, keys and hover preview, and removes the group from the tab order.
- The group is `role="slider"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, and `tabindex="0"` when editable.

## DOM contract

| Selector                    | Meaning                                        |
| --------------------------- | ---------------------------------------------- |
| `[data-testid="rating"]`    | the group: focus target, keydown and mouseleave |
| `[data-testid="star-<n>"]`  | the n-th star (1-based); `.filled` when lit     |
| `[data-testid="value"]`     | the committed value as text                     |

## Hidden edge cases

Clicking the current value, hovering without committing, clamping at both ends, unrelated keys, and every interaction while `readonly`.

## Run

```bash
pnpm dev:16
pnpm --filter 16-rating test
pnpm --filter 16-rating typecheck
```

`0` is a real rating, so it cannot also mean "not hovering" — that is what the `number | null` preview ref is for.
