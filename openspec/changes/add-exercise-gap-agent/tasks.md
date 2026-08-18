## 1. Agent scaffolding

- [ ] 1.1 Create `.claude/agents/exercise-gap-filler.md` with frontmatter: `name`,
      `description` (per proposal.md's capability summary), `tools: Read, Write, Edit,
      Glob, Grep, Bash(pnpm *)` (matches `.claude/commands/new-exercise.md`'s
      `allowed-tools` exactly).
- [ ] 1.2 Write the mode-switch rule at the top of the instruction body: no specific
      exercise/topic named in the invocation → analysis mode; a specific
      exercise/topic named → build mode. Make the rule explicit and deterministic
      (design.md's mitigation for ambiguous mode selection).

## 2. Analysis mode

- [ ] 2.1 Instruct the agent to derive current topic coverage from
      `packages/*/tests/*.spec.ts` (grep for topic signals) and cross-check against
      `docs/LEARNING_PATH.md`'s "Exam-topic coverage" table, per spec requirement
      "Coverage is grounded in actual tests, not just documentation."
- [ ] 2.2 Instruct the agent to exclude any topic on `docs/LEARNING_PATH.md`'s
      "Not covered by design" list (render functions, custom directives,
      Transitions, Teleport, Suspense, SSR) from candidates.
- [ ] 2.3 Instruct the agent to report, as part of its output, any mismatch it finds
      between the coverage table and what the tests actually exercise (table claims
      coverage a test doesn't support, or vice versa).
- [ ] 2.4 Instruct the agent's analysis-mode output format: a numbered shortlist of
      candidates (topic, proposed batch/slot, skills, rough time budget, and the gap
      each closes), and state explicitly that this mode writes no files.

## 3. Build mode

- [ ] 3.1 Instruct the agent to read `.claude/commands/new-exercise.md` and follow
      its Files / Wire-up / Verify sections, treating the named topic as that
      command's `$ARGUMENTS` — not a separately maintained copy of the contract.
- [ ] 3.2 Instruct the agent to stop and report (without writing any exercise files)
      if `.claude/commands/new-exercise.md` cannot be read.
- [ ] 3.3 Instruct the agent to run the full verify sequence after scaffolding
      (install, exercise tests red for the right reason, exercise typecheck clean
      while red, solution tests green, solution typecheck clean, `sync:tests` then
      `sync:tests:check`, `check`) and to report the slug, test count, and any
      failing step — never claiming completion if a step failed.

## 4. Verification

- [ ] 4.1 Smoke-test analysis mode: invoke the agent with no exercise named, confirm
      it returns a numbered shortlist, confirm no files under `packages/`,
      `solutions/`, or `docs/` changed, and confirm none of the "Not covered by
      design" topics appear in the shortlist.
- [ ] 4.2 (Optional — creates a real exercise if completed) Smoke-test build mode on
      one shortlisted candidate and confirm it scaffolds both trees, completes all
      four wire-up points, and reports a genuine verify outcome rather than an
      assumed success. If run, treat the resulting exercise as real repo content
      (update `docs/LEARNING_PATH.md`'s progress checklist etc. as that command
      already requires) rather than reverting it.
