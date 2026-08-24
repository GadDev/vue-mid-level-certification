## Why

Every exercise ships a red test suite and a README that says *what* to build, but
nothing in the repo teaches the concept **before** you attempt it. The two documents
that come closest both fail at that job for a different reason:

- `docs/PATTERNS.md` is a reference catalogue — terse, correct, ordered API-first, and
  written for someone who already knows the vocabulary and just wants the syntax.
- `docs/LEARNING_PATH.md`'s "What each one is really teaching" bullets are a *post-hoc*
  index for the human comparing their attempt against `solutions/`. Read up front, 01's
  bullet hands you the exercise's strategy (function ref + `nextTick` + reset-the-timer)
  before you've written a line.

A beginner starting exercise 06 has to reverse-engineer `defineModel`, `$attrs`
fallthrough and `useId` from a failing test suite, or read a catalogue entry that
assumes they already know why a wrapper around `<input>` is hard. This change adds the
missing layer: a beginner-paced, example-driven primer per exercise that stops
deliberately short of the exercise's own edge cases.

## What Changes

- Add `docs/lessons/NN-slug.md` for all 30 exercises, plus `docs/lessons/index.md`.
- Each lesson follows a fixed skeleton — **The problem → The main idea (with a naive
  attempt shown failing first) → You'll also meet → Reference → Now do Exercise NN** —
  and is bounded by a **spoiler line**: it teaches the API surface and mental model on
  small neutral examples, and does not discuss the exercise's hidden edge cases, its
  `data-testid` contract, or its solution.
- Establish **first-mention ownership** of concepts: ~21 distinct concepts span the 30
  exercises, so a lesson explains a concept in full only if it is the first to meet it,
  and otherwise opens by linking back to the lesson that owns it and stating what is
  newly hard here. Keeps all 30 files short and makes revisits read as progression.
- Establish an explicit division of labour with `docs/PATTERNS.md`: lessons are the
  front door (problem-first, prose-heavy, one scenario), PATTERNS stays the reference
  (API-first, terse). Each lesson links out to its PATTERNS section; each PATTERNS
  section gains a `Lesson: NN` cross-reference beside its existing `See: Exercise NN`.
- Wire lessons into the VitePress site (a `Lessons` nav entry and a `/lessons/` sidebar
  grouped by the six batches) and into each `packages/NN-slug/README.md` as a
  "Before you start" link.
- Add a lesson step to `.claude/skills/new-exercise` and a spoiler-line check to
  `.claude/skills/review-exercise`, so exercise 31 cannot ship lesson-less.

Explicitly unchanged: `docs/LEARNING_PATH.md` (its bullets keep their post-hoc role),
every `packages/*/src`, every `packages/*/tests`, and every exercise's difficulty.

## Capabilities

### New Capabilities
- `exercise-lessons`: a per-exercise, beginner-paced concept primer published in the
  docs site, bounded by a stated spoiler line, cross-referenced with `PATTERNS.md`
  rather than duplicating it, and required for any newly authored exercise.

### Modified Capabilities
(none — no existing capability's requirements change. `docs-blog` owns the blog under
`docs/`; this adds a sibling directory and touches only the shared VitePress config's
`nav`/`sidebar`.)

## Impact

- New: `docs/lessons/index.md` + `docs/lessons/NN-slug.md` × 30 (slugs match
  `packages/*` exactly, `01-scroll-to-item` … `30-debug-emits-store`).
- Modified: `docs/.vitepress/config.mts` (nav entry + a `sidebar` key, which the site
  does not currently have at all), `docs/PATTERNS.md` (a `Lesson: NN` line per
  section), `packages/NN-slug/README.md` × 30 (one "Before you start" link each), root
  `README.md` (a Lesson column on the exercise table), `CLAUDE.md` (repo-state note),
  `.claude/skills/new-exercise`, `.claude/skills/review-exercise`.
- CI: `docs/` is inside the affected-aware fence, so lesson edits keep
  `test:solutions` filtered. Touching all 30 `packages/*/README.md` files **is** inside
  `packages/`, so this change triggers one full solution-suite run. Expected, harmless.
- Link directions, which are asymmetric:
  - **lesson → exercise** (`docs/lessons/index.md` → `../../packages/…`) is a built
    page linking outside the site root. `ignoreDeadLinks: [/\.\.\//]` already silences
    exactly this — valid on GitHub, unresolvable in the deployed site. Expected.
  - **exercise README → lesson** is not a VitePress concern at all: `packages/*` is not
    part of the build, so there is no built copy to be dead. Those links work wherever
    the README is read in the repo.
- Independent of the in-progress `add-exercise-gap-agent` change; no shared files. It
  reads `.claude/commands/new-exercise.md` as the single source of the authoring
  contract, so extending that file (not copying it) means its build mode inherits the
  lesson step for free.
