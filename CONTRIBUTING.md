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

```bash
pnpm install
pnpm test              # whole repo — packages/* are red by design, solutions/* must be green
pnpm typecheck
pnpm check             # biome lint + format
pnpm sync:tests:check  # only relevant if you touched a spec
```

If you're adding a new exercise, see `docs/LEARNING_PATH.md` for where it fits in the six batches and `docs/PATTERNS.md` for the idioms exercises are expected to teach — both should be updated alongside the exercise itself, along with a row in the root `README.md` and a `dev:NN` script in `package.json`.

## Reporting issues

Bug reports, unclear exercise requirements, and typos in docs are all welcome as GitHub issues on this repo.
