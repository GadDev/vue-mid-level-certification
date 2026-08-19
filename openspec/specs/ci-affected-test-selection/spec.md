# ci-affected-test-selection

## Purpose

Governs how `.github/workflows/ci.yml` decides which `solutions/*` packages' tests to run for a
given push or pull request: either an affected subset — computed from the git diff against a
resolved base plus the pnpm workspace dependency graph — or the full unfiltered set when the
change is too broad to scope safely. Exists so that a change confined to one exercise's solution
package doesn't pay for all 30 solution packages' Vitest runs, while changes to shared or root-level
files still trigger a full run.

## Requirements

### Requirement: Affected-only solution test selection
The CI workflow SHALL run the `test:solutions` step against only the `solutions/*` packages affected by the current push or pull request, where "affected" means the package's own files changed since the resolved diff base, or the package depends (directly or transitively, per the pnpm workspace graph) on a package that changed since the diff base.

#### Scenario: Single exercise changed
- **WHEN** a pull request only modifies files under `solutions/13-accordion/`
- **THEN** the `test:solutions` step SHALL run Vitest only for the `13-accordion-solution` package, not the other 29 solution packages

#### Scenario: Shared dependency changed
- **WHEN** a pull request modifies files under `shared/exercise-shell/`
- **THEN** the `test:solutions` step SHALL run Vitest for all 30 `solutions/*` packages, because every solution package depends on `@practice/exercise-shell`

#### Scenario: No solutions affected
- **WHEN** a pull request only modifies files under `packages/*` (exercise starters) or `docs/` with no corresponding `solutions/*` or `shared/*` changes
- **THEN** the `test:solutions` step SHALL run against an empty affected set and SHALL NOT fail the job solely because zero packages matched

### Requirement: Fallback to full test run on unscoped changes
The CI workflow SHALL run the full, unfiltered `test:solutions` step (all 30 `solutions/*` packages) whenever the diff since the resolved diff base includes any file outside `packages/`, `solutions/`, `shared/`, or `docs/`.

#### Scenario: Root config file changed
- **WHEN** a pull request modifies `tsconfig.base.json`, `biome.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, or `.github/workflows/ci.yml`
- **THEN** the `test:solutions` step SHALL run against all 30 `solutions/*` packages regardless of whether any package-scoped files also changed

#### Scenario: Diff base cannot be resolved
- **WHEN** the workflow cannot resolve a valid diff base (e.g. `github.event.before` is the all-zero SHA on a new branch's first push, or merge-base resolution fails)
- **THEN** the `test:solutions` step SHALL run against all 30 `solutions/*` packages rather than skipping or narrowing the run

### Requirement: Sufficient git history for diff computation
The CI workflow's checkout step SHALL fetch sufficient git history (via `fetch-depth: 0` or an equivalent depth guaranteed to include the diff base) so that the affected-package computation and the fallback path check can each perform an accurate `git diff` against the resolved base.

#### Scenario: Shallow clone would break diffing
- **WHEN** the `test` job checks out the repository
- **THEN** the checkout step SHALL be configured such that `git diff <base>...HEAD` and pnpm's `[<since>]` filter can resolve the base commit without a "not a valid object" or missing-history error

### Requirement: Scope limited to test:solutions
The affected-selection and fallback logic introduced by this capability SHALL apply only to the `test:solutions` step of `ci.yml`. The `check`, `typecheck`, `sync:tests:check`, `build`, and `docs:build` steps SHALL continue to run unfiltered against the whole workspace.

#### Scenario: Other CI steps unaffected
- **WHEN** any push or pull request triggers the CI workflow
- **THEN** `check`, `typecheck`, `sync:tests:check`, `build`, and `docs:build` SHALL execute exactly as they did before this change, with no path or affected-package filtering applied
