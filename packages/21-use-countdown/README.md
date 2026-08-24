# Exercise 21 — `useCountdown()`

**Time limit: 30 min** · Skills: interval ownership, guard against double timers, `onScopeDispose`, formatting

> **Before you start:** read [Lesson 21 — Owning `setInterval`](../../docs/lessons/21-use-countdown.md).

## Prompt

```ts
useCountdown(seconds = 60, options: { onDone?: () => void } = {}): {
  remaining: ComputedRef<number>    // seconds
  running: ComputedRef<boolean>
  finished: ComputedRef<boolean>
  formatted: ComputedRef<string>    // 'mm:ss'
  start(): void
  pause(): void
  reset(seconds?: number): void
}
```

## Requirements

- It starts paused at the full duration, with **no timer running**.
- `start()` ticks once per second. Calling it twice must not create a second interval (that is a clock running at double speed).
- `pause()` stops the interval and keeps the remaining time; `start()` resumes from there. Pausing while stopped is harmless.
- At zero it stops itself, `running` goes false, `finished` goes true, and `onDone` fires **once**. It never goes negative.
- `start()` on a finished countdown does nothing until it is reset.
- `reset()` stops and restores the initial duration; `reset(n)` adopts `n` as the new duration for later resets too.
- `formatted` is zero-padded `mm:ss` — 90 → `01:30`, 600 → `10:00`.
- The interval must not outlive the scope, and two countdowns are fully independent.

## DOM contract

| Selector                 | Meaning                                        |
| ------------------------ | ---------------------------------------------- |
| `[data-testid="time"]`   | the formatted time                              |
| `[data-testid="start"]`  | disabled while running or finished              |
| `[data-testid="pause"]`  | disabled unless running                         |
| `[data-testid="reset"]`  | back to the start                               |
| `[data-testid="done"]`   | present only once finished                      |

## Hidden edge cases

Double `start()` (check `vi.getTimerCount()`), pause-then-resume, overshooting zero, restarting after finish, `onDone` firing again after a reset, and scope teardown.

## Run

```bash
pnpm dev:21
pnpm --filter 21-use-countdown test
pnpm --filter 21-use-countdown typecheck
```

Guard `start()` on the **timer handle**, not on the `running` flag — they can disagree, and the handle is the thing that would leak.
