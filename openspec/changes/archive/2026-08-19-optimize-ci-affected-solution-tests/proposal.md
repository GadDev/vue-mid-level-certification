## Why

`ci.yml`'s `test:solutions` step always runs `pnpm --filter "./solutions/*" test` across all 30 solution packages, regardless of which files a push or PR actually touched. Since every exercise is self-contained (per `CLAUDE.md`, no code is shared between exercises except `shared/exercise-shell`), a PR that only touches `solutions/13-accordion` still pays for 29 unrelated Vitest runs. pnpm's workspace graph already knows this dependency shape for free — every solution package declares `@practice/exercise-shell": "workspace:*"` — so the affected set can be computed without adopting a new tool (e.g. Nx). This isn't a wall-clock pain point today; it's a correctness-of-scope improvement: only run what a change could plausibly affect.

## What Changes

- `ci.yml`'s `test:solutions` step becomes affected-aware: it runs `pnpm --filter` scoped to solution packages that changed since the PR's merge-base with its target branch, plus any packages that depend on a changed package (so a `shared/exercise-shell` change still re-triggers all 30 solutions).
- A fallback check runs first: if the diff touches any file outside `packages/`, `solutions/`, `shared/`, `docs/` (root config, lockfile, `tsconfig.base.json`, `biome.json`, `pnpm-workspace.yaml`, the CI workflow itself, etc.), the step falls back to the current full unfiltered `pnpm test:solutions` run.
- `actions/checkout` in `ci.yml` gains `fetch-depth: 0` (or otherwise sufficient depth) so the git-diff-based filter has history to compare against.
- The diff base is the merge-base with the PR's target branch (or the pushed branch's prior state on `main`), not `HEAD~1`, so rebases/force-pushes and multi-commit pushes diff correctly.
- Scope is intentionally narrow: `check` (Biome), `typecheck`, `sync:tests:check`, `build`, and `docs:build` are **unchanged** — they remain full, unfiltered, whole-repo runs. Only `test:solutions` is optimized.

## Capabilities

### New Capabilities
- `ci-affected-test-selection`: Governs how `ci.yml` decides which solution packages' tests to run for a given push/PR — either the affected subset (git-diff + workspace-dependency-graph aware) or the full unfiltered set when a fallback condition is met.

### Modified Capabilities
(none — no existing specs cover CI behavior yet)

## Impact

- **Affected files**: `.github/workflows/ci.yml` only. No application code, exercise code, or `package.json` scripts change.
- **Risk**: Under-running tests if the fallback glob list is incomplete or the merge-base computation is wrong — mitigated by `main`'s own CI still running the full suite on every push to `main`, and by the narrow, single-step scope of this change.
- **No new dependencies**: uses pnpm's built-in filter syntax; no Nx/Turborepo adoption.
