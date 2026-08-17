# Exercise 12 — Composables with Cleanup

**Time limit: 35 min** · Skills: reusable composables, `onScopeDispose`, browser-event cleanup, `shallowRef`, deep watching, SSR safety

## Prompt

Two composables and one component that uses both.

### `useLocalStorage<T>(key, initial): Ref<T>`

- Reads the stored value on creation. Falls back to `initial` when the key is missing **or** the stored JSON is corrupt (`'{not json'` must not throw).
- Persists on change, **deeply** — changing `note.value.text` has to be written.
- Listens for `storage` events (another tab wrote) and updates, but only for **its own key**.
- Removes that listener when the owning scope is disposed, and stops persisting after that.
- Never touches `window` unguarded — it must survive SSR and a browser with storage blocked.

### `useWindowSize(): { width, height }`

- `shallowRef` numbers (plain values that are always replaced — deep reactivity would be wasted work).
- Initialised from `window.innerWidth/innerHeight`, `0` when there is no window.
- Updates on `resize`, and removes the listener on scope dispose.

### `NotesPanel.vue`

Persists `{ text, pinned }` under the key `note`, shows the window width, derives `layout` (`narrow` below 700 px, `wide` from 700 px up), and has a Clear button resetting the note.

## DOM contract

| Selector                   | Meaning                                  |
| -------------------------- | ---------------------------------------- |
| `[data-testid="note"]`     | text input bound to `note.text`           |
| `[data-testid="pinned"]`   | checkbox bound to `note.pinned`           |
| `[data-testid="width"]`    | current window width                      |
| `[data-testid="layout"]`   | `narrow` or `wide`                        |
| `[data-testid="clear"]`    | resets the note to `{ text: '', pinned: false }` |

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
