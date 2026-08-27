# Setup & Troubleshooting

## Prerequisites

- **Node.js 24 LTS+** — Check with `node --version`. Vite 7's actual floor is 20.19+ (or 22.12+), but this repo targets current LTS.
- **pnpm 10+** — Check with `pnpm --version`

If you don't have pnpm, install it:

```bash
npm install -g pnpm@latest
```

## Installation

From the project directory, install dependencies:

```bash
pnpm install
```

## Running an Exercise

Start the development server for any exercise:

```bash
pnpm dev:01   # Exercise 01 … through pnpm dev:30 for Exercise 30
```

Each shortcut is just a filter, so the long form works too:

```bash
pnpm --filter 06-base-input dev
pnpm --filter 12-composable-storage dev
```

The Vite dev server will start at `http://localhost:5173`. Open it in your browser to see the exercise.

## Running Tests

Run all tests across all exercises:

```bash
pnpm test
```

**Exercise tests start red — that is the point.** `pnpm test` runs both trees, so a full run always reports failures until you have implemented everything; it passes `--no-bail` for that reason and reports every package instead of stopping at the first red one. `pnpm test:exercises` is your work (it stops at the first failing package), `pnpm test:solutions` should be entirely green.

Run tests for one exercise:

```bash
pnpm --filter 01-scroll-to-item test
```

Narrow it down to one file or one test:

```bash
pnpm --filter 10-pinia-cart test cart.store              # one spec file
pnpm --filter 10-pinia-cart test -t 'merges into the existing line'   # one test by name
```

Run tests in watch mode (re-runs on file changes):

```bash
pnpm test:watch                                # every package
pnpm --filter 05-counter-history test --watch  # just one
```

## Linting & Formatting

This repository uses **Biome** for linting and formatting (replacing Prettier).

Check for lint/format issues:

```bash
pnpm check
```

Auto-fix everything (safe fixes only):

```bash
pnpm check:fix
```

Lint or format only:

```bash
pnpm lint          # lint
pnpm lint:fix      # lint with safe fixes applied
pnpm format        # check formatting
pnpm format:fix    # apply formatting
```

**Configuration**: See `biome.json` for settings

- Semi-colons: as-needed (omitted unless required)
- Quotes: single
- Trailing commas: ES5 style
- Line width: 100 characters
- Indent: 2 spaces

Biome only looks at `packages/**` and `solutions/**`, so nothing under `docs/` is linted or formatted by `pnpm check`.

**TypeScript**: every package is TypeScript with strict `vue-tsc` checking. Run `pnpm typecheck` for the whole workspace, or `pnpm --filter <exercise> typecheck` for one.

**Tests**: `packages/*` specs start red — they are the exercise spec. `solutions/*/tests/` is generated from `packages/*/tests/` by `pnpm sync:tests` (`pnpm sync:tests:check` fails on drift).

Note: Biome's Vue support can't see identifiers used only inside `<template>` (e.g. a component imported in `<script setup>` and referenced as a tag, or a function bound via `@click`). To avoid false-positive "unused" fixes that would break the app, `noUnusedImports` and `noUnusedVariables` are disabled for `*.vue` files in `biome.json`.

**IDE Integration** (recommended):

- **VS Code**: Install the Biome extension, enable "Format on Save", set it as the default formatter
- **WebStorm**: Settings → Languages & Frameworks → Biome, enable format-on-save
- **Other IDEs**: Most support Biome plugins

If `pnpm exec biome ...` reports "Linter process terminated abnormally (possibly out of memory)" in this environment, it's the `rtk` Claude Code hook interfering with the subprocess spawn — bypass it with `rtk proxy pnpm exec biome ...`.

## Building

Build all exercises for production:

```bash
pnpm build
```

Build a single exercise:

```bash
pnpm --filter 04-sort-products build
```

## Troubleshooting

### "Module not found" or strange import errors

Reinstall, keeping the lockfile (it pins the versions every exercise was written against — deleting it is how you end up debugging a dependency upgrade instead of an exercise):

```bash
pnpm install --force
```

If that is not enough, clear every `node_modules` in the workspace — the root one is not the only one, each package has its own:

```bash
find . -name node_modules -type d -prune -exec rm -rf {} +
pnpm install
```

### Vite dev server won't start

Try killing the process on port 5173 and restarting:

```bash
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Then restart:
pnpm dev:01
```

### Tests are failing

First: **check whether they are supposed to be.** Every exercise ships a red suite, so failures in `packages/*` are the starting state, not a broken setup. Compare against `pnpm test:solutions`, which should be green. Read the failing assertion — it is the requirement.

If a watcher is stale after a change, restart it (Ctrl+C, run again).

### `window.localStorage` in exercises 12 and 24

This vitest/jsdom combination does not reliably expose `window.localStorage`, so the two packages that persist — **12** (`useLocalStorage`-style composable) and **24** (the Pinia wishlist) — each ship a `vitest.setup.ts` that installs a minimal in-memory `Storage` before the specs run. If you see every test in one of them fail in `beforeEach` with `localStorage` undefined, check that `setupFiles: ['./vitest.setup.ts']` is still in its `vite.config.ts`. Nothing in `src/` depends on the shim; your composable or store still has to guard the API itself.

### "pnpm: command not found"

Install pnpm globally:

```bash
npm install -g pnpm
```

Verify: `pnpm --version`

### IDE won't recognize imports or has type errors

Most IDEs (VS Code, WebStorm, etc.) need a restart after `pnpm install`. Reload your editor.

If using TypeScript in your editor, ensure you have the latest TypeScript extension/plugin installed.

## Next Steps

- Read **[LEARNING_PATH.md](LEARNING_PATH.md)** to understand the skill progression
- Check **[PATTERNS.md](PATTERNS.md)** for common Vue 3 code patterns
- Start with Exercise 01 and follow the practice workflow in the [main README](../README.md)
