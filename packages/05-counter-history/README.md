# Exercise 05 — Counter History

**Time limit: 30 min** · Skills: composables, encapsulated state, computed guards, undo/redo

> **Before you start:** read [Lesson 05 — Your first `useX()` composable](../../docs/lessons/05-counter-history.md).

## Prompt

Implement `useCounterHistory()` in `src/composables/useCounterHistory.ts` and wire it to `Counter.vue`. **All** state and rules live in the composable — the component only binds it to the DOM.

The composable returns:

```ts
{
  count: ComputedRef<number>   // read-only: callers change it through the actions
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  increment, decrement, reset, undo, redo   // () => void
}
```

## Requirements

- Every count-**changing** action (increment, decrement, reset) is undoable.
- A reset that changes nothing (reset at `0`) is **not** recorded.
- A new change after an undo clears the redo history.
- `undo`/`redo` at the end of their stack are no-ops, not crashes.
- `canUndo`/`canRedo` drive the `disabled` attribute on the Undo/Redo buttons.
- Two calls to `useCounterHistory()` produce two fully independent counters (no module-level state).
- Negative counts are allowed.

## DOM contract

| Selector                       | Meaning                                    |
| ------------------------------ | ------------------------------------------ |
| `[data-testid="count"]`        | text is the current count                   |
| `[data-testid="increment"]`    | +1                                          |
| `[data-testid="decrement"]`    | −1                                          |
| `[data-testid="reset"]`        | back to 0                                   |
| `[data-testid="undo"]`         | `disabled` when `!canUndo`                  |
| `[data-testid="redo"]`         | `disabled` when `!canRedo`                  |

## Hidden edge cases

Undo/redo past the end of the stack, reset then undo, redo invalidation after a new change, negative counts, and two independent instances.

## Run

```bash
pnpm dev:05
pnpm --filter 05-counter-history test      # 20 tests (13 composable + 7 component)
pnpm --filter 05-counter-history typecheck
```

`tests/useCounterHistory.spec.ts` tests the composable without mounting anything — that is the payoff of putting the logic there.
