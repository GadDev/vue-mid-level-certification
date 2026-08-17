# Exercise 18 — Notification Queue

**Time limit: 30 min** · Skills: composable factory, one timer per item, `onScopeDispose`, presentational component

## Prompt

Toast notifications: several at once, each disappearing on its own schedule.

```ts
useToasts(duration = 3000): {
  toasts: ComputedRef<Toast[]>
  notify: (message: string, type?: ToastType) => number   // returns the id
  dismiss: (id: number) => void
  clear: () => void
}
```

`ToastList.vue` is purely presentational: `props: { toasts }`, `emits: { dismiss: [id] }`.

## Requirements

- `notify` appends (oldest first) and returns the new id. Identical messages get **distinct ids**.
- Default type is `'info'`.
- Each toast auto-dismisses `duration` ms after **it** was queued — one timer per toast, not one shared timer.
- `dismiss(id)` removes it immediately and cancels its timer; an unknown id is a no-op.
- `clear()` empties the queue and every pending timer.
- `duration === 0` means the toast is sticky: no timer at all.
- Pending timers must not outlive the scope (`onScopeDispose`).
- No module-level state — two queues are independent.
- `ToastList` renders nothing at all when the queue is empty, tags each item with its type as a class, and emits `dismiss` with the id.

## DOM contract

| Selector                    | Meaning                                   |
| --------------------------- | ----------------------------------------- |
| `[data-testid="toasts"]`    | the `<ul>` — absent while the queue is empty |
| `[data-testid="toast"]`     | one toast; its class includes its type      |
| `[data-testid="message"]`   | the message text                            |
| `[data-testid="dismiss"]`   | dismisses that toast                        |

## Hidden edge cases

Queue order, duplicate messages, staggered timers, dismissing before the timer fires (`vi.getTimerCount()` must reach 0), an unknown id, a zero duration, and scope teardown.

## Run

```bash
pnpm dev:18
pnpm --filter 18-notification-queue test
pnpm --filter 18-notification-queue typecheck
```

Keep a `Map<id, timer>`: without it, `dismiss` leaves a timer that fires into an empty queue.
