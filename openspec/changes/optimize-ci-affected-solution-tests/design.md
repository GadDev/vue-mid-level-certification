## Context

`ci.yml` runs one job (`test`) on every push to `main` and every PR, with no path filtering. Its `test:solutions` step invokes `pnpm --filter "./solutions/*" test`, which runs Vitest across all 30 `solutions/<NN-name>-solution` packages every time, even when a change only touches one exercise.

All 60 packages under `packages/*` and `solutions/*` declare `"@practice/exercise-shell": "workspace:*"` as a real dependency, and no other cross-package dependency exists between exercises (each is a self-contained Vite app per `CLAUDE.md`). This means pnpm's own workspace graph — built from `pnpm-workspace.yaml` and each package's `dependencies` — already models the one fan-out relationship that matters: a change to `shared/exercise-shell` affects every solution package; a change to one solution package affects only itself.

pnpm's filter syntax exposes this graph directly (`--filter "...{<path>}[<since>]"`): scope to a path, restrict to packages changed since a git ref, and include dependents of changed packages. No new tool (Nx, Turborepo) is needed to get affected-package selection — the graph already exists in the workspace's own dependency declarations. Nx's affected-detection would additionally provide computation caching, but with 30 small Vite/Vitest packages that already run in seconds, caching has no meaningful workload to cache — only the "don't run what didn't change" behavior is worth adopting here.

## Goals / Non-Goals

**Goals:**
- Run `test:solutions` only against solution packages affected by the current push/PR (changed directly, or depending on something changed) whenever it is safe to narrow the run.
- Preserve full-suite correctness: any change that pnpm's package-level graph cannot see (root config, lockfile, workflow file, or anything outside `packages/`, `solutions/`, `shared/`, `docs/`) must fall back to running all 30 solution packages, unfiltered.
- Keep the change confined to the `test:solutions` step of `ci.yml`. No other step's behavior changes.

**Non-Goals:**
- Adopting Nx, Turborepo, or any new build-orchestration tool.
- Adding task-output caching (skip-if-inputs-unchanged beyond git diff).
- Filtering `check`, `typecheck`, `sync:tests:check`, `build`, or `docs:build`.
- Changing what CI does for `packages/*` (exercises) — those are intentionally not tested in CI (red by design) and stay that way.

## Decisions

### Use pnpm's built-in filter syntax, not `dorny/paths-filter` or Nx
pnpm's `--filter "...{./solutions}[<ref>]"` intersects three things pnpm already understands natively: a path scope, a git diff, and the workspace dependency graph (dependents via the leading `...`). `dorny/paths-filter` can express path globs and boolean outputs but has no concept of the workspace dependency graph — using it alone would require hand-maintaining a mapping from `shared/exercise-shell` changes to "all 30 solutions," which is exactly the kind of drift-prone hardcoding this change is meant to avoid. Nx would provide the same graph-aware selection but requires adopting `nx.json`, a project graph, and a new CLI dependency for a benefit (computation caching) that doesn't apply here.

### Fallback path check via a plain git diff, not `dorny/paths-filter`
The fallback ("did something outside packages/solutions/shared/docs change?") is a single inverse-glob check. A `git diff --name-only "$BASE"...HEAD | grep -qvE '^(packages|solutions|shared|docs)/'`-style check (or equivalent) run as a plain shell step is simpler than introducing an extra action for one boolean, and keeps the whole selection logic in one place (a single shell script step) rather than split across a marketplace action's outputs and a follow-up pnpm invocation.

### Diff base = merge-base with target branch, not `HEAD~1`
For `pull_request` events, `${{ github.event.pull_request.base.sha }}` is the correct base — comparing against it (or its merge-base with `HEAD`) is stable across force-pushes and rebases. For `push` events to `main`, `${{ github.event.before }}` is used, with a fallback to running the full suite if `github.event.before` is the all-zero SHA (first push / new branch) or otherwise unresolvable.

### `fetch-depth: 0` on checkout
pnpm's `[since]` filter and the fallback's `git diff` both need commit history beyond the default shallow clone (`fetch-depth: 1`). `fetch-depth: 0` is the safe default here; a smaller explicit depth is not worth the fragility of guessing how far back a PR's commits go.

## Risks / Trade-offs

- **[Risk]** The fallback glob list (`packages/`, `solutions/`, `shared/`, `docs/`) is incomplete or a new top-level directory is added later without updating it → silently under-runs tests for changes to that new area.
  **Mitigation**: The fallback is intentionally an *inverse* check ("anything NOT in these four directories triggers full run"), so new unlisted top-level paths (new files at repo root, new tooling directories) trigger the safe full-run path by default rather than being silently excluded. Document the glob list in the workflow file itself and in `CLAUDE.md`'s CI section if one is added later.
- **[Risk]** `fetch-depth: 0` increases checkout time slightly (full history clone) for every CI run.
  **Mitigation**: This repo's history is small; the cost is negligible relative to `pnpm install` and the build/typecheck steps that remain unfiltered.
- **[Risk]** A bug in the merge-base/diff-base computation silently narrows the affected set incorrectly on some event type (e.g. `workflow_dispatch`, first push to a new branch).
  **Mitigation**: Treat any diff-base resolution failure as "run full suite" rather than "run nothing" — the fallback direction is always toward safety (more tests), never fewer.
- **[Trade-off]** No computation caching means a package whose only change is a comment or formatting fix still fully re-runs its own Vitest suite (just not the other 29). Accepted — this change targets scope reduction, not per-package incrementality.

## Migration Plan

1. Update `.github/workflows/ci.yml`: add `fetch-depth: 0` to the `actions/checkout` step, add a step that resolves the diff base and computes the fallback boolean, and change the `test:solutions` invocation to branch on that boolean.
2. Validate on this change's own PR: confirm the affected-only path runs when only files under `solutions/` change, and confirm the fallback fires correctly when a root file (e.g. `pnpm-workspace.yaml`) is touched in a throwaway test commit, then revert that test commit before merge.
3. No rollback complexity beyond reverting the workflow file — this change has no effect on application code, package scripts, or test suites themselves, only on which subset of a workspace-level `pnpm` invocation CI runs.

## Open Questions

- Exact final pnpm filter string syntax (`"...{./solutions}[$BASE]"` vs. an equivalent form) should be verified against the installed pnpm version's documentation/`--help` output during implementation, rather than assumed from memory.
- Whether to also key the fallback off changes to `.github/workflows/ci.yml` itself (a change to the CI logic should probably always run full tests, at least once, to validate the new logic) — leaning yes, since the workflow file is already outside the four allowed directories and so is already covered by the inverse glob.
