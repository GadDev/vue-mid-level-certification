---
description: Scaffold a new Vue exercise in both trees, wire it up, and verify it
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(pnpm *)
---

## New exercise: $ARGUMENTS

Author a complete exercise from the topic in $ARGUMENTS. Next free number = highest in
`packages/` + 1. Slug is `NN-kebab-name`.

Copy `packages/04-sort-products/` as the shape reference (config files are near-identical).
**Authoring both trees is expected here** — CLAUDE.md rule 3 forbids copying `solutions/` into
`packages/` when *solving*, not when *writing* the exercise.

### Files

```
packages/NN-name/
  package.json          name "NN-name"; copy 04's dep block verbatim
  tsconfig.json         extends ../../tsconfig.base.json
  vite.config.ts        one-liner, doubles as vitest config (jsdom, globals)
  index.html
  README.md             Title + time limit + skills → Prompt → DOM contract table
                        → Requirements → Hidden edge cases → Run
  src/main.ts, src/App.vue
  src/components/*.vue  starter, TODOs, data-testid already in place
  src/data/*.ts         only if shared state: module-scoped ref + resetX()
  tests/*.spec.ts       the spec — red by design, selects on data-testid
solutions/NN-name/      identical file-for-file; package.json name "NN-name-solution";
                        real implementation; tests/ GENERATED, never hand-written
```

Composables / stores / routers export **factories**, never module-level state.
`<script setup lang="ts">`, single quotes, no semicolons, 100 cols, strict TS.

### Wire-up (all four, none optional)

1. root `package.json` → `"dev:NN"` script
2. `docs/LEARNING_PATH.md` → table row + "what it's really teaching" bullet + exam-coverage
   row + progress-checklist line
3. root `README.md` → exercise list
4. `CLAUDE.md` "Repo state" → the hard-coded `NNN tests total (01=16, …)` line is now wrong;
   update the total and add `NN=<count>`

### Verify — run these and report each result

1. `pnpm install`
2. `pnpm --filter NN-name test` → **red for the right reason**: failing assertions, not an
   import or syntax error
3. `pnpm --filter NN-name typecheck` → clean *while still red* (breaks most often)
4. `pnpm --filter NN-name-solution test` → green, and its typecheck clean
5. `pnpm sync:tests` then `pnpm sync:tests:check`
6. `pnpm check`

Report the slug, test count, and any step you could not get green.
