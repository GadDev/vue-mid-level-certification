---
"@practice/release": patch
---

Add a `.github/actions/setup-pnpm` composite action (pnpm + Node.js with pnpm store cache + `pnpm
install --frozen-lockfile`) and use it across `ci.yml`, `docs.yml`, and `changesets.yml` in place of
duplicated setup steps. Split `ci.yml`'s single sequential job into parallel jobs (`check`, `typecheck`,
`sync-tests`, `build`, `docs-build`, `test-solutions`, plus a `setup` job computing the affected-diff
base) converging on a `test` aggregator job — kept under that name so existing branch-protection status
checks keep working unmodified. Also adds a `concurrency` group (cancels stale runs on new pushes),
`permissions: contents: read`, per-job `timeout-minutes`, and a `lint-workflows` job running `actionlint`
against every workflow file.
