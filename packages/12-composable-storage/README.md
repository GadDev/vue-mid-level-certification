# Exercise 12 — Composables with Cleanup

**Time limit: 35 min** · Skills: reusable composables, `onScopeDispose`, browser-event cleanup, `shallowRef`, deep watching, SSR safety

> **Before you start:** read [Lesson 12 — Composables that clean up after themselves](../../docs/lessons/12-composable-storage.md). It walks through `onScopeDispose`, deep `watch`, `shallowRef`, and the SSR `window` guard with a *different* example than this exercise, so the pattern is familiar before you have to apply it here.

## What you're building

A little sticky note. Type in it and it saves itself — reload the page and your text is still there. Open the app in a second browser tab, edit the note in one tab, and the other tab picks up the change live. Resize the window and a label on screen flips between `narrow` and `wide`. Under the hood that's two small, independent, reusable pieces of logic (**composables** — plain functions that use Vue's reactivity outside of a component) plus one component that wires them together.

## Prompt

Work through these in order. Each one has its own test file (or `describe` block) you can run in isolation, so you don't have to get everything working before you see a green checkmark.

### Step 1 — `useWindowSize()` in `src/composables/useWindowSize.ts`

Track the browser window's size reactively.

- Initialise from `window.innerWidth` / `window.innerHeight`. If there's no `window` (server-side rendering, or a test that doesn't provide one), start at `0` instead of throwing.
- Update on the browser's `resize` event.
- Use `shallowRef` for the two numbers, not `ref` — the value is always fully replaced (a fresh number on every resize), never mutated in place, so the deep-reactivity tracking a plain `ref` sets up would be wasted work. See the lesson's "You'll also meet" section for why.
- Stop listening for `resize` when the composable's owning scope is torn down — this is the `onScopeDispose` cleanup from the lesson, and it's what the "removes its resize listener" test below checks.

**Checkpoint:**

```bash
pnpm --filter 12-composable-storage test -t 'useWindowSize'
```

All three `useWindowSize` tests should pass before you move on.

### Step 2 — `useLocalStorage<T>(key, initial)` in `src/composables/useLocalStorage.ts`

A `Ref<T>` that reads from and writes to `localStorage`, and stays in sync with other tabs.

- On creation, read the value already stored under `key`. Fall back to `initial` when the key is missing **or** the stored JSON is corrupt — a raw string like `'{not json'` must not throw and crash the app.
- Whenever the ref's value changes, write it back to `localStorage` as JSON — including when a *nested* field changes (`note.value.text = 'x'`), not just when `.value` is replaced wholesale. Plain `watch` misses nested changes; the lesson's "Deep watch" section shows the option that fixes it.
- Listen for the browser's `storage` event (fired when *another tab* changes the same key) and update the ref to match — but only when the event is for **this composable's own `key`**. A `storage` event fires for every key any tab writes, across the whole origin, so skipping the check means one composable clobbers another's data.
- Remove that listener, and stop persisting entirely, once the owning scope is disposed.
- Never touch `window` or `localStorage` unguarded — this composable has to survive running with no `window` at all (SSR) and a browser where storage access throws.

**Checkpoint:**

```bash
pnpm --filter 12-composable-storage test -t 'useLocalStorage'
```

All ten `useLocalStorage` tests should pass before you move on.

### Step 3 — `NotesPanel.vue` in `src/components/NotesPanel.vue`

Wire both composables into one component.

- Persist a note shaped `{ text, pinned }` under the `localStorage` key `'note'`, using `useLocalStorage` from Step 2.
- Show the current window width from `useWindowSize` (Step 1).
- Derive a `layout` value from that width: `'narrow'` below 700px, `'wide'` from 700px up.
- Add a Clear button that resets the note back to `{ text: '', pinned: false }`.

**Checkpoint:**

```bash
pnpm --filter 12-composable-storage test -t 'NotesPanel'
```

All five `NotesPanel` tests should pass — and since this step reuses Steps 1 and 2 under the hood, it's also a good end-to-end check that cleanup on unmount really works (see the "leaves no listeners behind" test).

## DOM contract

The tests find elements by their `data-testid` attribute rather than by tag or class, so the UI can be styled freely as long as these five stay exactly as named — don't rename or remove them.

| Selector                 | Meaning                                          |
| ------------------------- | ------------------------------------------------- |
| `[data-testid="note"]`   | text input bound to `note.text`                  |
| `[data-testid="pinned"]` | checkbox bound to `note.pinned`                   |
| `[data-testid="width"]`  | current window width                              |
| `[data-testid="layout"]` | `narrow` or `wide`                                |
| `[data-testid="clear"]`  | resets the note to `{ text: '', pinned: false }`  |

## Traps

- **`onScopeDispose`, not `onUnmounted`.** The tests run both composables inside a bare `effectScope()` as well as inside a component; `onUnmounted` never fires in the first case, and the leak test (`removeEventListener` called with `'storage'` / `'resize'`) fails.
- **Deep watch.** A shallow watch misses `note.value.text = '…'` — persistence silently stops working for nested edits.
- **Corrupt JSON.** `JSON.parse` must be wrapped; one bad entry otherwise breaks the whole app on load.
- **Key filtering.** A `storage` event fires for every key in the origin; reacting to all of them overwrites your state with someone else's data.

## Run

```bash
pnpm dev:12
pnpm --filter 12-composable-storage test      # 18 tests
pnpm --filter 12-composable-storage typecheck
```

`vitest.setup.ts` installs a minimal in-memory `localStorage` because this jsdom build does not expose one. Nothing in `src/` depends on it.
