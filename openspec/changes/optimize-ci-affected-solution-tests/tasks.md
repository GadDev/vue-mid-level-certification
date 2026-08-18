## 1. Checkout & diff-base resolution

- [ ] 1.1 Add `fetch-depth: 0` to the `actions/checkout` step in `.github/workflows/ci.yml`'s `test` job
- [ ] 1.2 Add a step that resolves the diff base: `${{ github.event.pull_request.base.sha }}` for `pull_request` events, `${{ github.event.before }}` for `push` events
- [ ] 1.3 In that step, detect an unresolvable base (all-zero SHA, missing value, or a base commit not present in the fetched history) and set a `full-run` output flag when detected

## 2. Fallback path check

- [ ] 2.1 Add a step that runs `git diff --name-only <base>...HEAD` against the resolved base
- [ ] 2.2 Set the `full-run` output flag to true if any changed path falls outside `packages/`, `solutions/`, `shared/`, `docs/` (in addition to the case from 1.3)

## 3. Affected-package test invocation

- [ ] 3.1 Verify the exact pnpm filter syntax for "packages under a path, changed since a ref, plus dependents" against the installed pnpm version (`pnpm --help` / docs) before finalizing the command
- [ ] 3.2 Replace the `pnpm test:solutions` run step with a conditional: full unfiltered `pnpm test:solutions` when `full-run` is true, otherwise the affected-scoped pnpm filter command restricted to `solutions/*`
- [ ] 3.3 Handle the zero-affected-packages case so the step succeeds (no-op) rather than failing when the filter matches no packages

## 4. Validation

- [ ] 4.1 Open a throwaway PR that only touches a single `solutions/<NN-name>` package and confirm CI logs show only that package's Vitest run
- [ ] 4.2 Open a throwaway PR that touches `shared/exercise-shell` and confirm CI logs show all 30 solution packages running
- [ ] 4.3 Open a throwaway PR that touches a root file (e.g. `pnpm-workspace.yaml`) and confirm CI logs show the full unfiltered fallback run
- [ ] 4.4 Confirm `check`, `typecheck`, `sync:tests:check`, `build`, and `docs:build` steps are unchanged in behavior and timing across all three validation runs
- [ ] 4.5 Remove/revert any throwaway validation commits before merging

## 5. Documentation

- [ ] 5.1 Add a short note in `CLAUDE.md` (or wherever CI behavior is documented) describing the affected-test-selection behavior and the four-directory fallback list, so future contributors adding a new top-level directory know to reconsider the fallback glob
