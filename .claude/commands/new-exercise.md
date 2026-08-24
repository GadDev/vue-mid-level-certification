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

### Wire-up (all five, none optional)

1. root `package.json` → `"dev:NN"` script
2. `docs/LEARNING_PATH.md` → table row + "what it's really teaching" bullet + exam-coverage
   row + progress-checklist line
3. root `README.md` → exercise list (Exercise, Lesson and Main-skills columns)
4. `CLAUDE.md` "Repo state" → the hard-coded `NNN tests total (01=16, …)` line is now wrong;
   update the total and add `NN=<count>`
5. **`docs/lessons/NN-name.md`** — a beginner-paced primer, written *before* comparing
   against the solution so it can't leak one. Fixed skeleton, in this order:

   ```markdown
   # Lesson NN — <concept-facing title, not the exercise title>

   > Prep for Exercise NN. Concepts and examples only — this page does not
   > discuss the exercise's edge cases or its solution.

   ## The problem
   ## The main idea        (naive attempt shown failing FIRST, then the idiom)
   ## You'll also meet     (only if the exercise teaches >1 concept; 2-4 paragraphs each)
   ## Reference            (→ docs/PATTERNS.md § ..., → earlier lessons this builds on)
   ## Now do Exercise NN    (one line, no hints)
   ```

   Target 150–250 lines. The lesson MUST NOT mention: any `data-testid` from the DOM
   contract, anything from "Hidden edge cases", the test count, or the exercise's specific
   domain objects — teach the API surface on small, neutral examples instead. If a concept
   here is already owned by an earlier lesson (check `docs/lessons/index.md`), link back and
   describe only what's newly hard, rather than re-explaining it. Every code block must be a
   complete, copy-paste-runnable `<script setup lang="ts">` SFC or `.ts` module (house
   style: no semicolons, single quotes) — except a block explicitly introduced as the
   failing naive attempt. Then register it:
   - `docs/lessons/index.md` → a row in the matching batch table
   - `docs/.vitepress/config.mts` → a sidebar entry under `/lessons/`, in the matching batch
   - `packages/NN-name/README.md` → a "Before you start" link before `## Prompt`
   - `docs/PATTERNS.md` → a `**Lesson**: NN` line beside the section(s) it references

### Verify — run these and report each result

1. `pnpm install`
2. `pnpm --filter NN-name test` → **red for the right reason**: failing assertions, not an
   import or syntax error
3. `pnpm --filter NN-name typecheck` → clean *while still red* (breaks most often)
4. `pnpm --filter NN-name-solution test` → green, and its typecheck clean
5. `pnpm sync:tests` then `pnpm sync:tests:check`
6. `pnpm check`

Report the slug, test count, and any step you could not get green.
