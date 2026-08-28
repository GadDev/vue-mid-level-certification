# Exercise 03 — Search Users

**Time limit: 25 min** · Skills: `computed`, `v-model`, filtering, empty states

> **Before you start:** read [Lesson 03 — `computed`, and why not a method](../../docs/lessons/03-search-users.md).

## What you're building

A searchable user directory: type a name and the list filters live, with a result count and an empty state when nothing matches.

## Prompt

Render the supplied users. Add case-insensitive client-side search **by name** using a `computed` property — not a method, not a watcher. Trim the query, show the result count, and show an empty state when nothing matches.

TypeScript: declare a `User` interface and type the computed as `computed<User[]>`.

## DOM contract

| Selector                    | Meaning                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `[data-testid="search"]`    | the search input (`v-model`)                                |
| `[data-testid="user"]`      | one per visible user, text contains the name **and** role   |
| `[data-testid="count"]`     | text contains the number of visible users                   |
| `[data-testid="empty"]`     | rendered **only** when zero users match                     |

## Requirements

- Empty or whitespace-only query → every user, no empty state.
- Matching is case-insensitive and matches substrings anywhere in the name (including across spaces, e.g. `"marie dup"`).
- Role is displayed but **not** searched.
- Clearing the query restores the full list.

## Why `computed`

A method re-runs on every re-render; a `computed` caches until `search` changes. Be ready to explain that difference — it is a classic exam and interview question.

## Hidden edge cases

Empty query, spaces-only query, mixed case, names containing spaces, no-match then cleared.

## Run

```bash
pnpm dev:03
pnpm --filter 03-search-users test      # 15 tests, red until you implement
pnpm --filter 03-search-users typecheck
```
