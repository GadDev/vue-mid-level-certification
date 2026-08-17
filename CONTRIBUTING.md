# Contributing

Participation in this project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).

Contributions are welcome — new exercises, bug fixes in `shared/exercise-shell`, corrections to the docs, or fixes to a solution that doesn't actually pass its own spec.

## Ground rules

1. **Never edit `packages/*/tests/*.spec.ts`.** The tests are the spec for that exercise. If a test looks wrong, open an issue explaining why rather than changing it in the same PR that also makes it pass.
2. **Never copy `solutions/` into `packages/`.** Exercises are meant to be solved against the README + spec.
3. **`solutions/*/tests/` is generated.** Edit the `packages/` copy of a spec, then run `pnpm sync:tests` and commit the regenerated solution copy. `pnpm sync:tests:check` verifies they're in sync — CI (and reviewers) will check this.
4. **`data-testid` attributes are part of the contract.** Don't rename or remove one a spec selects on.
5. Batch 1–5 exercises are TODO-style (`src/` is incomplete); Batch 6 (29–30) is deliberately debug-style (`src/` is complete but wrong). Don't "fix" 29/30 into a TODO shape.

## Before opening a PR

CI runs these same checks, in this order — matching them locally avoids surprises:

```bash
pnpm install
pnpm check             # biome lint + format
pnpm typecheck         # every package, including packages/* — starters must still type-check
pnpm sync:tests:check  # only meaningful if you touched a spec
pnpm test:solutions    # must be green
pnpm build
```

CI does **not** run `pnpm test:exercises` — `packages/*` specs are red by design until a learner finishes them, so that's not something a PR is expected to fix.

If you edit anything under `docs/`, also run `pnpm docs:build` — it's part of CI and will catch broken internal links (VitePress fails the build on a dead link within `docs/`).

If you're adding a new exercise, see `docs/LEARNING_PATH.md` for where it fits in the six batches and `docs/PATTERNS.md` for the idioms exercises are expected to teach — both should be updated alongside the exercise itself, along with a row in the root `README.md` and a `dev:NN` script in `package.json`.

## Reporting issues

Bug reports, unclear exercise requirements, and typos in docs are all welcome as GitHub issues on this repo.
