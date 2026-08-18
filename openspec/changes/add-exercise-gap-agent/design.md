## Context

The repo already has one human-driven mechanism for adding an exercise
(`.claude/commands/new-exercise.md`) and one for auditing existing ones
(`.claude/commands/review-exercise.md`). Both are slash commands: a single markdown
file with frontmatter and an instruction body, invoked explicitly by name. Neither
one decides *what* to build next — a human still has to notice a coverage gap in
`docs/LEARNING_PATH.md`'s exam-topic table.

`review-exercise.md` already establishes the operating principle this design leans
on: the docs can drift from reality, so re-derive facts from the code (test counts,
`TODO` presence, table rows) rather than trusting what's written down. The new agent
applies the same principle to *coverage* instead of *difficulty*.

## Goals / Non-Goals

**Goals:**
- Turn "what topic is missing" into a repeatable, on-demand analysis grounded in the
  actual `packages/*` tests, not just the coverage table's claims.
- Let the same subagent carry a proposal through to a scaffolded, verified exercise,
  without duplicating `/new-exercise`'s Files/Wire-up/Verify contract in a second file.
- Keep a human checkpoint between "here's what's missing" and "files got written" —
  scaffolding touches root `README.md`, `CLAUDE.md`, and `docs/LEARNING_PATH.md`, which
  is not something to do on the agent's own judgment of what counts as a gap.

**Non-Goals:**
- Not building a standalone coverage-report script/CLI (rejected during proposal
  clarification in favor of an LLM subagent — the "is this actually covered" judgment
  needs to read test intent, not just grep for keywords).
- Not changing `/new-exercise.md` or `/review-exercise.md` themselves.
- Not auto-selecting or auto-building a candidate without the human naming one first.
- Not proposing topics from `docs/LEARNING_PATH.md`'s explicit "Not covered by
  design" list (render functions, custom directives, Transitions, Teleport, Suspense,
  SSR).

## Decisions

**One subagent file, two modes, mode chosen by whether the invocation names a
concrete exercise.** `.claude/agents/exercise-gap-filler.md` is invoked via the Agent
tool. If the prompt doesn't name a specific exercise to build, it runs analysis mode:
survey `packages/*/tests` and `docs/LEARNING_PATH.md`'s coverage table, cross-check
against `docs/PATTERNS.md`'s batch groupings, and return a short numbered list of
candidate exercises (topic, proposed batch/slot, skills, rough time budget, and why
it's a gap) as its final text — no files written. If the prompt names a specific
exercise (either one of its own prior candidates, echoed back by the human, or a
topic the human specifies directly), it runs build mode.
- *Alternative considered*: two separate agent files (a finder and a builder).
  Rejected — the builder would either duplicate `/new-exercise`'s contract a third
  time, or the finder would need to invoke the builder, and subagents have no
  mechanism to invoke a slash command as a tool call. One file with an explicit mode
  switch avoids both problems.
- *Alternative considered*: fully autonomous propose-and-build in one pass. Rejected
  per the Goals above — the human should choose which gap is worth an exercise before
  ten-plus files and four wire-up points get touched.

**Build mode reuses `/new-exercise.md` by reading it, not by copying it.** The agent's
instructions tell it to read `.claude/commands/new-exercise.md` and follow its Files /
Wire-up / Verify sections verbatim, treating the chosen topic as that command's
`$ARGUMENTS`. If `/new-exercise.md` changes later (a new wire-up point, a different
verify step), this agent stays correct automatically instead of drifting.
- *Alternative considered*: inline a copy of the scaffolding contract into the new
  agent file for self-containedness. Rejected — CLAUDE.md's own review tooling
  (`review-exercise.md`) exists specifically because duplicated/derived facts drift;
  writing a second copy of the same contract recreates that exact problem.

**Tool access mirrors `/new-exercise.md` exactly**: `Read, Write, Edit, Glob, Grep,
Bash(pnpm *)`. Analysis mode only exercises the read-side tools; build mode needs the
full set. Scoping `Bash` to `pnpm *` (not unrestricted) matches the existing command
and keeps the agent from running arbitrary shell.

**Gap detection reads test files, not just the coverage table.** Analysis mode greps
`packages/*/tests` for topic signals (e.g. `Teleport`, `provide(`, `beforeEach`
patterns) rather than trusting `docs/LEARNING_PATH.md`'s "Exam-topic coverage" table
verbatim, per `review-exercise.md`'s existing finding that the table can go stale.
Any mismatch between the table and what the agent derives is reported as part of the
proposal, not silently corrected.

**Next exercise number and slug are derived the same way `/new-exercise.md` already
derives them** (highest existing `packages/NN-*` + 1, `NN-kebab-name`), so build mode
never disagrees with what a human running `/new-exercise` by hand would get.

## Risks / Trade-offs

- **[Risk]** "Is this topic actually a gap" is a judgment call, not a deterministic
  check → **Mitigation**: analysis mode always returns a numbered shortlist with
  cited rationale (coverage-table row, or its absence; exclusion-list check), and
  build mode never fires until a human names one.
- **[Risk]** A single file with two modes could be invoked ambiguously (unclear which
  mode fires) → **Mitigation**: the mode switch is one explicit rule — build mode
  requires a named exercise/topic in the invocation; everything else is analysis mode.
- **[Risk]** Build mode's correctness depends on `/new-exercise.md` continuing to
  exist at its current path → **Mitigation**: if that file is missing, the agent
  reports that and stops rather than guessing at the scaffolding contract.
- **[Risk]** Scaffolding touches 10+ files and 4 wire-up points; a half-finished
  exercise is worse than none → **Mitigation**: build mode ends with the identical
  verify sequence `/new-exercise.md` specifies (install, red-for-the-right-reason,
  typecheck clean while red, solution green, `sync:tests`, `check`) and reports any
  step it could not get green, exactly as that command already requires.

## Migration Plan

Purely additive — one new file, no existing behavior changes. Rollback is deleting
`.claude/agents/exercise-gap-filler.md`.

## Open Questions

- Exact agent filename/description wording — finalized when the file is written in
  tasks.md, not blocking on this design.
