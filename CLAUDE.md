# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Vue 3 + TypeScript practice repo for the mid-level Vue certification. pnpm workspace, two mirrored trees:

- `packages/<NN-name>/` — the exercise: starter `src/` full of `TODO`s, a `README.md` with the DOM contract, and a **test suite that starts red**.
- `solutions/<NN-name>/` — reference implementation, verified by a generated copy of the same specs.

## Rules that matter here

1. **Red tests are the expected state.** `pnpm test` fails on `packages/*` by design — that is why it (and `pnpm typecheck`) passes `--no-bail` and keeps going. `test:exercises`/`test:solutions` do **not**: they stop at the first failing package, so use `pnpm test` when you want the whole picture. Never "fix" the repo by making failing exercise tests pass in the test file.
2. **Never edit `packages/*/tests/*.spec.ts`.** The tests are the spec. Make them green by writing `src/`.
3. **Never copy from `solutions/` into `packages/`.** Implement against the exercise README + spec. `solutions/` exists for the human to compare against *afterward*.
4. **`solutions/*/tests/` is generated** by `scripts/sync-tests.sh`. Edit the `packages/` copy, then `pnpm sync:tests`. `pnpm sync:tests:check` verifies (currently in sync). Never hand-edit a solution test copy.
5. **`data-testid` attributes are the contract.** The specs select on them; don't rename or remove them when implementing.

## Commands

```bash
pnpm install
pnpm test              # all packages — exercises red by design, solutions green
pnpm test:exercises    # packages/* only
pnpm test:solutions    # solutions/* only
pnpm typecheck         # vue-tsc across every package
pnpm check             # Biome lint + format check   (check:fix to auto-fix)
pnpm build
pnpm sync:tests        # regenerate solutions/*/tests from packages/*/tests
```

Per package — `dev:01`…`dev:30` all exist; `--filter` does the same thing:

```bash
pnpm dev:04
pnpm --filter 10-pinia-cart dev
pnpm --filter 10-pinia-cart test                         # whole package
pnpm --filter 10-pinia-cart test cart.store              # one spec file
pnpm --filter 10-pinia-cart test -t 'adds a line item'   # one test by name
pnpm --filter 10-pinia-cart test --watch
pnpm --filter 10-pinia-cart typecheck
pnpm --filter 10-pinia-cart-solution test                # solutions are `<name>-solution`
```

## Architecture

Each exercise is a **self-contained Vite app** — its own deps, its own `tsconfig.json` extending `tsconfig.base.json`, and a one-line `vite.config.ts` that doubles as the vitest config (`jsdom`, `globals: true`, no setup file except 12's `localStorage` shim); no *exercise* code is shared between packages, so exercises can't break each other. The one exception is `shared/exercise-shell` (below), which is scaffolding, not exercise material. Inside one, `main.ts` → `App.vue` → `src/components/*.vue` is browser-only scaffolding (specs usually mount the component directly, except where the exercise *is* the composition, e.g. 09 mounts `App.vue` with a router), while the two non-obvious decisions live below it: `src/data/*.ts` exports a **module-scoped reactive `ref`** plus a `resetX()` the specs call in `beforeEach` — so in-place mutation leaks across consumers, which is exactly what 02/04 test — and `src/composables|stores|router/*` export **factories, never module-level state** (`useCounterHistory()`, `createAppRouter(history)`), so specs can build fresh instances without mounting; those signatures are part of the contract. The two trees are identical file-for-file (`TODO`s vs. implementation), so a new exercise needs both sides plus `pnpm sync:tests`.

**`shared/exercise-shell`** is a third workspace tree (`shared/*` in `pnpm-workspace.yaml`), published to every package as `@practice/exercise-shell`. It exports `ExerciseLayout` — the sticky nav bar with the exercise title and an `ExerciseTimer` counting down that exercise's README budget — and every `App.vue` in both trees is now `<ExerciseLayout title="NN-name" :minutes="N">…</ExerciseLayout>` with no `<main>`/`<h1>` of its own. It lives outside `packages/*` on purpose: `sync-tests.sh`, `test:exercises` and the `NN-name` convention all glob that directory. Three constraints hold it in place — its `data-testid`s are all `exercise-*`-prefixed (10 specs mount `App.vue` and select by testid), the timer **auto-starts by default** (`autostart` defaults to `true`, and no `App.vue` overrides it) — no spec currently mounts `App.vue` under `vi.useFakeTimers()`, so nothing fights the clock, but a new spec that does both should pass `:autostart="false"`; and `packages/<name>/README.md`'s `**Time limit: N min**` line is the single source of truth for the budget in *both* trees. It carries its own suite (`pnpm --filter @practice/exercise-shell test`) because no exercise spec covers it.

Idioms the exercises expect: @docs/PATTERNS.md · what each one teaches: @docs/LEARNING_PATH.md · environment and troubleshooting: @docs/SETUP.md

## Conventions

- `<script setup lang="ts">` everywhere; Composition API only, no Options API.
- Strict TS with `verbatimModuleSyntax` — inline type imports: `import { type Product, products } from '../data/products'`.
- Biome: single quotes, **no semicolons**, 100-col lines, 2-space indent, ES5 trailing commas, no parens on single-arg arrows. `noUnusedImports`/`noUnusedVariables` are off for `*.vue` (template-only usage).
- Prefer immutable derivation inside `computed` (`[...items.value].sort(...)`).

## Repo state

- **01–30 all exist and are fully documented** — exercise README, specs, starter `src/`, synced solution tests, a `dev:NN` script, and a row in root `README.md` + `docs/LEARNING_PATH.md`. Six batches: 01–05 fundamentals, 06–12 composition & ecosystem, 13–17 component patterns, 18–23 stateful UI & composables, 24–28 ecosystem at scale, 29–30 debugging. Verified: every solution passes, `sync:tests:check` clean, **479 tests total** (01=16, 02=14, 03=15, 04=9, 05=20, 06=20, 07=17, 08=11, 09=11, 10=28, 11=20, 12=18, 13=10, 14=11, 15=12, 16=15, 17=14, 18=18, 19=18, 20=19, 21=22, 22=19, 23=15, 24=18, 25=21, 26=18, 27=16, 28=10, 29=15, 30=9).
- **29 and 30 are debug-style**, not TODO-style: `src/` ships complete but wrong, and the work is finding the bug. Don't "fix" them by rewriting the starter into the solution — the broken code *is* the exercise.
- `docs/PATTERNS.md` documents idioms for every batch, 01–30. `docs/ANTI_PATTERNS.md` still only catalogues near-miss traps for batches 1–2 (AP-1…AP-9) — batches 3–6 have no anti-pattern entries yet.
- **12 and 24 are the packages with a `vitest.setup.ts`** — this jsdom build doesn't reliably expose `window.localStorage`, so the setup file installs an in-memory `Storage` (present in both trees, wired via `setupFiles`). `src/` must still guard the API itself for SSR. Any new persisting exercise needs the same file plus the `setupFiles` line.
- Biome lints `packages/**`, `solutions/**` and `shared/**`, so `pnpm check` verifies nothing under `docs/` — the doc code blocks are unchecked. `pnpm check` is currently **clean**. Note `noUnusedFunctionParameters` is off for `packages/**` (starter stubs leave parameters unused), and a few starters carry a `biome-ignore lint/style/useConst` on a `let` the *learner's* implementation reassigns — do not let `--write` turn those back into `const`, it makes the exercise unsolvable.
- **`shared/exercise-shell` is a spoiler for 21** — its timer implements the same double-start guard, `onScopeDispose` cleanup and `remaining`/`running` surface that `21-use-countdown` asks the learner to write, and 21 depends on it. Left as-is deliberately; exclude 21 or obfuscate the component if that matters.
- Not a git repository.
