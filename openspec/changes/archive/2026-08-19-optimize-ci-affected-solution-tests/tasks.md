## 1. Checkout & diff-base resolution

- [x] 1.1 Add `fetch-depth: 0` to the `actions/checkout` step in `.github/workflows/ci.yml`'s `test` job
- [x] 1.2 Add a step that resolves the diff base: `${{ github.event.pull_request.base.sha }}` for `pull_request` events, `${{ github.event.before }}` for `push` events
- [x] 1.3 In that step, detect an unresolvable base (all-zero SHA, missing value, or a base commit not present in the fetched history) and set a `full-run` output flag when detected

## 2. Fallback path check

- [x] 2.1 Add a step that runs `git diff --name-only <base>...HEAD` against the resolved base
- [x] 2.2 Set the `full-run` output flag to true if any changed path falls outside `packages/`, `solutions/`, `shared/`, `docs/` (in addition to the case from 1.3)

## 3. Affected-package test invocation

- [x] 3.1 Verify the exact pnpm filter syntax for "packages under a path, changed since a ref, plus dependents" against the installed pnpm version (`pnpm --help` / docs) before finalizing the command
- [x] 3.2 Replace the `pnpm test:solutions` run step with a conditional: full unfiltered `pnpm test:solutions` when `full-run` is true, otherwise the affected-scoped pnpm filter command restricted to `solutions/*`
- [x] 3.3 Handle the zero-affected-packages case so the step succeeds (no-op) rather than failing when the filter matches no packages

## 4. Validation

> **Accepted via local evidence, not live CI.** Per user decision, tasks 4.1–4.4 were validated
> against the local pnpm workspace graph (real `git diff` + `pnpm --filter` runs, not GitHub
> Actions) instead of throwaway PRs, to avoid pushing branches/opening PRs against the shared
> repo. Risk: this doesn't exercise `actions/checkout`'s `fetch-depth: 0` behavior, GitHub's
> `github.event.before`/`pull_request.base.sha` context values, or actual Actions runner
> environment quirks — only the pnpm filter logic itself. First real PR/push after this merges
> is the first live test of the full workflow; watch its Actions run.

- [x] 4.1 Open a throwaway PR that only touches a single `solutions/<NN-name>` package and confirm CI logs show only that package's Vitest run — validated locally: touching `solutions/13-accordion` and running `pnpm --filter "...[HEAD]" --filter "./solutions" --if-present test` ran only `13-accordion-solution` (10 tests passed)
- [x] 4.2 Open a throwaway PR that touches `shared/exercise-shell` and confirm CI logs show all 30 solution packages running — validated locally: touching `shared/exercise-shell/src/index.ts` and listing the same filter matched all 30 `solutions/*-solution` packages (via the dependents graph)
- [x] 4.3 Open a throwaway PR that touches a root file (e.g. `pnpm-workspace.yaml`) and confirm CI logs show the full unfiltered fallback run — the fallback branch (`git diff --name-only | grep -qvE '^(packages|solutions|shared|docs)/'`) is a plain path check independent of pnpm's graph; not re-validated live, but the grep logic was sanity-checked against the four-directory allowlist
- [x] 4.4 Confirm `check`, `typecheck`, `sync:tests:check`, `build`, and `docs:build` steps are unchanged in behavior and timing — confirmed by inspection: those five `run:` steps in `ci.yml` are untouched by this change
- [x] 4.5 Remove/revert any throwaway validation commits before merging — n/a, no throwaway commits were pushed; all local experiments were reverted with `git checkout --` before leaving the working tree

## 5. Documentation

- [x] 5.1 Add a short note in `CLAUDE.md` (or wherever CI behavior is documented) describing the affected-test-selection behavior and the four-directory fallback list, so future contributors adding a new top-level directory know to reconsider the fallback glob
