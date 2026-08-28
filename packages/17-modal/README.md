# Exercise 17 — Modal

**Time limit: 30 min** · Skills: slots with fallbacks, scoped slots, `.self` modifier, listener lifecycle

> **Before you start:** read [Lesson 17 — Fallback content, and listeners that die with the component](../../docs/lessons/17-modal.md).

## What you're building

A reusable dialog box that any part of the app can pop open — closable by clicking outside it, pressing Escape, or its own close button — without deciding for itself whether it should be open.

## Prompt

A reusable dialog. The parent owns whether it is open; the modal only asks to be closed.

```ts
withDefaults(defineProps<{ open: boolean; title?: string }>(), { title: 'Dialog' })
defineEmits<{ close: [] }>()
defineSlots<{
  header?: () => unknown
  default?: () => unknown
  footer?: (props: { close: () => void }) => unknown
}>()
```

## Requirements

- While closed, **nothing** is rendered — no overlay, no dialog.
- The dialog is `role="dialog"` with `aria-modal="true"`.
- Slots: `header` (falls back to the `title` prop), the default slot as the body, and `footer` — which receives `close` and falls back to a close button.
- A click on the **backdrop** closes; a click anywhere inside the dialog does not.
- `Escape` closes — but only while the modal is open.
- The key listener is added when it opens and removed when it closes **or** when the component unmounts. A leaked listener closes the next dialog someone opens.

## DOM contract

| Selector                   | Meaning                                  |
| -------------------------- | ---------------------------------------- |
| `[data-testid="overlay"]`  | the backdrop; clicking it closes          |
| `[data-testid="modal"]`    | the dialog box; clicking it does not close |
| `[data-testid="body"]`     | wraps the default slot                    |
| `[data-testid="close"]`    | the fallback footer button                 |

## Hidden edge cases

Clicks inside the dialog bubbling to the backdrop, `Escape` while closed, `Escape` after closing, unmount cleanup, and a footer slot that replaces the default button.

## Run

```bash
pnpm dev:17
pnpm --filter 17-modal test
pnpm --filter 17-modal typecheck
```

`@click.self` is the whole backdrop story — a bare `@click` on the overlay also fires for every click that bubbles up from inside it.
