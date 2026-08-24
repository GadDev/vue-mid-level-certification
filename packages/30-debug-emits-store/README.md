# Exercise 30 — Debug: Emits & Pinia

**Time limit: 20 min** · Skills: the `v-model` contract, store reactivity, module scope vs setup scope

> **Before you start:** read [Lesson 30 — Contracts that look fine until there are two](../../docs/lessons/30-debug-emits-store.md).

## Prompt

`src/` is **complete but wrong** again. Two independent bugs, both of which look like "the state is broken" and are really "the wiring is broken".

## The symptoms

| Component            | What the user sees                                                     |
| -------------------- | ---------------------------------------------------------------------- |
| `SearchField.vue` → `SearchPanel.vue` | typing does nothing to the parent, and Clear does nothing |
| `CounterPanel.vue` + `stores/counter.ts` | the buttons run, but the panel never re-renders — and a second app starts with the first one's count |

## Requirements

- Typing in the field updates the parent's `term`, and the input keeps showing the parent's value.
- The child's Clear button empties it.
- The `label` prop still reaches the field.
- The counter panel re-renders `count` **and** `double` after every action, and `Reset` returns to 0.
- Each pinia instance owns its own counter: a second mount starts at 0 while the first keeps its value.

## DOM contract

| Selector                     | Meaning                             |
| ---------------------------- | ----------------------------------- |
| `[data-testid="input"]` / `[data-testid="clear"]` / `[data-testid="label"]` | the child field |
| `[data-testid="term"]`       | the parent's copy of the value       |
| `[data-testid="empty"]`      | shown while the term is empty        |
| `[data-testid="count"]` / `[data-testid="double"]` | store state and getter |
| `[data-testid="increment"]` / `[data-testid="reset"]` | store actions |

## The lessons hiding in here

`v-model` listens for `update:modelValue` — an emit with any other name is a payload sent nowhere. Destructuring a store copies values out of it. And state declared at **module scope** inside a store file is created once per import, not once per pinia.

## Run

```bash
pnpm dev:30
pnpm --filter 30-debug-emits-store test
pnpm --filter 30-debug-emits-store typecheck
```

Both bugs type-check, and both components "work" in isolation — which is what makes this shape of bug worth practising.
