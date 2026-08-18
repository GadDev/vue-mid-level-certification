## Why

Growing this repo past exercise 30 currently requires a human to notice a gap in
`docs/LEARNING_PATH.md`'s exam-topic coverage table, invent a topic, and drive
`/new-exercise` by hand. There is no repeatable way to ask "what's missing, and can
you fill it" — coverage gaps and thin/duplicated slots accumulate silently as the repo
grows past what one person tracks in their head.

## What Changes

- Add a new Claude Code subagent (`.claude/agents/exercise-gap-filler.md`) that:
  - Re-derives real topic coverage from `packages/*` and the exam-topic table in
    `docs/LEARNING_PATH.md`, rather than trusting the table (which `review-exercise.md`
    already treats as driftable).
  - Identifies uncovered or thin topics, excluding the "not covered by design" list
    (render functions, custom directives, Transitions, Teleport, Suspense, SSR).
  - Proposes one or more candidate exercises (topic, batch slot, skills, time budget)
    and stops for confirmation before creating files.
  - On confirmation, scaffolds the chosen exercise end-to-end by following the same
    contract as the existing `/new-exercise` slash command (both trees, all four
    wire-up points, the full verify sequence) — reusing that command's instructions
    rather than duplicating them in a second place.
- No changes to existing exercises, specs, or the `/new-exercise` / `/review-exercise`
  commands themselves.

## Capabilities

### New Capabilities
- `exercise-gap-agent`: a subagent that analyzes exam-topic coverage across the
  existing exercises, proposes new exercises to close the gaps it finds, and — once a
  proposal is confirmed — scaffolds that exercise into both `packages/` and
  `solutions/` following the repo's existing exercise-authoring contract.

### Modified Capabilities
(none — this does not change requirements for any existing capability)

## Impact

- New file: `.claude/agents/exercise-gap-filler.md` (or similar name — finalized in
  design.md).
- Reads (never edits): `docs/LEARNING_PATH.md`, `docs/PATTERNS.md`,
  `docs/ANTI_PATTERNS.md`, `.claude/commands/new-exercise.md`, `packages/*`.
- Writes (only after user confirmation, and only via the same paths `/new-exercise`
  already writes): a new `packages/NN-name/` + `solutions/NN-name/` pair, plus the four
  wire-up points (`package.json` dev script, `docs/LEARNING_PATH.md`, root `README.md`,
  `CLAUDE.md` repo-state counts).
- No changes to `openspec/specs/` for any existing capability.
