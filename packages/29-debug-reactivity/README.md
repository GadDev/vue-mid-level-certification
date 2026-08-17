# Exercise 29 — Debug: Reactivity, Computed & Watch

**Time limit: 25 min** · Skills: reading broken reactive code — the certification's bug-fixing challenge

## Prompt

Unlike every other exercise, `src/` here is **complete but wrong**. Three components, four bugs, no TODOs: the tests describe the behaviour that was intended, and your job is to find why it does not happen.

Do not rewrite the components — find the smallest change that makes each one correct.

## The symptoms

| Component     | What the user sees                                                          |
| ------------- | --------------------------------------------------------------------------- |
| `Counter.vue` | `increment()` runs, but the number on screen never moves                      |
| `Cart.vue`    | the total is right once and then stale — and the cart reorders itself         |
| `Profile.vue` | the "saves" counter never goes up, for the name or the city                   |

## Requirements

- `Counter`: `+` adds the step, `Reset` returns to 0, both reflected in the DOM.
- `Cart`: the total tracks additions and removals; the cheap-first list is sorted **without** reordering the cart or the shared `initialLines`.
- `Profile`: every real change — top-level *or* nested — increments `saves` exactly once and records the name. Setting a field to the value it already had saves nothing.

## DOM contract

| Selector                       | Meaning                             |
| ------------------------------ | ----------------------------------- |
| `[data-testid="count"]`        | the rendered count                   |
| `[data-testid="increment"]` / `[data-testid="reset"]` | counter buttons |
| `[data-testid="line"]`         | the cart, in cart order              |
| `[data-testid="cheap"]`        | the same lines, cheapest first       |
| `[data-testid="total"]`        | the cart total                       |
| `[data-testid="name"]` / `[data-testid="city"]` / `[data-testid="saves"]` / `[data-testid="last"]` | the profile |

## The lessons hiding in here

Destructuring a `reactive()` object, `ref(expression)` where a `computed` was meant, `Array.prototype.sort` mutating inside a getter, and a watch source that returns the same reference every time.

## Run

```bash
pnpm dev:29
pnpm --filter 29-debug-reactivity test
pnpm --filter 29-debug-reactivity typecheck
```

Every bug here type-checks cleanly — which is exactly why they survive code review.
