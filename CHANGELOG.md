# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) —
though as a practice repo with no published package, versions here mark content
milestones (exercise-set completeness) rather than API compatibility.

## [Unreleased]

### Added

- `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
- GitHub Actions CI (`check`, `typecheck`, `sync:tests:check`, `test:solutions`, `build`)
- Dependabot config for npm (grouped) and GitHub Actions
- Issue templates (bug report, new exercise proposal) and a PR template
- `.nvmrc`, `.npmrc` (`engine-strict`), and `engines`/`license` fields in `package.json`
- "Open in StackBlitz" links per exercise, plus a repo-wide badge
- VitePress-built docs site generated from `docs/*.md`
- Release workflow that publishes a GitHub Release from this changelog on `v*` tags

## [1.0.0] - 2026-08-17

### Added

- All 30 exercises (01–30) across six batches, each with a starter (`packages/`), a
  reference solution (`solutions/`), a README with a DOM contract, and a red-by-design
  test suite — 479 tests total
- `shared/exercise-shell` — the sticky nav bar + countdown timer used by every exercise
- `docs/SETUP.md`, `docs/LEARNING_PATH.md`, `docs/PATTERNS.md`, `docs/ANTI_PATTERNS.md`
- `scripts/sync-tests.sh` keeping `solutions/*/tests` generated from `packages/*/tests`
- Biome for linting/formatting, strict `vue-tsc` typechecking across every package

[Unreleased]: https://github.com/GadDev/vue-mid-level-certification/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/GadDev/vue-mid-level-certification/releases/tag/v1.0.0
