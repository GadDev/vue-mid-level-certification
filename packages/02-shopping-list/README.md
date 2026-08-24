# Exercise 02 — Shopping List

**Time limit: 30 min** · Skills: reactive state, CRUD, inline editing, view state vs domain state

> **Before you start:** read [Lesson 02 — State that describes the UI vs. state that describes the data](../../docs/lessons/02-shopping-list.md).

## Prompt

Build a shopping list supporting **add, inline edit, duplicate, delete and A–Z sorting**. Reject blank names. Keep ids unique.

Keep the items pure domain data (`{ id, name }`). Edit state — *which* row is being edited and the in-progress text — belongs in its own refs, **not** on the item objects. That is what makes "sort while editing" and "delete the row you are editing" behave.

TypeScript: declare an `Item` interface and type `items` as `ref<Item[]>`.

## DOM contract

| Selector                       | Meaning                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `li`                           | one per item                                               |
| `[data-testid="item-name"]`    | the name, shown when the row is **not** being edited        |
| `[data-testid="add-form"]`     | submit adds the item                                        |
| `[data-testid="new-item"]`     | the add input                                               |
| `[data-testid="sort"]`         | Sort A–Z button                                             |
| `[data-testid="edit"]`         | per row, enters edit mode (hidden while that row is edited)  |
| `[data-testid="edit-input"]`   | per row, only while editing, pre-filled with the name        |
| `[data-testid="save"]`         | per row, only while editing                                 |
| `[data-testid="duplicate"]`    | per row, always visible                                     |
| `[data-testid="delete"]`       | per row, always visible — including while the row is edited  |

## Requirements

- Names are trimmed on add and on save; the add input clears after a successful add.
- A blank or whitespace-only name is rejected on add, and on save keeps the original name.
- Only one row can be in edit mode at a time.
- Duplicating gives the copy a fresh id (editing one copy must not put the other in edit mode).
- Sorting produces a **new** array; a row being edited stays in edit mode and moves with the sort.

## Hidden edge cases

Whitespace-only additions, editing to blank, deleting the row currently being edited, sorting mid-edit, and sorting items added after mount.

## Run

```bash
pnpm dev:02
pnpm --filter 02-shopping-list test      # 14 tests, red until you implement
pnpm --filter 02-shopping-list typecheck
```
