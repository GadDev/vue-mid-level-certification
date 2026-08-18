## ADDED Requirements

### Requirement: Analysis mode proposes candidates without writing files
When invoked without a specific exercise or topic named in the prompt, the agent
SHALL derive current topic coverage from `packages/*/tests` and
`docs/LEARNING_PATH.md`, and SHALL return a numbered shortlist of candidate exercises
(topic, proposed batch/slot, skills, rough time budget, and the gap it closes) as its
final output. It SHALL NOT create, edit, or wire up any exercise files in this mode.

#### Scenario: Invoked with no target named
- **WHEN** the agent is invoked with a prompt that does not name a specific exercise
  or topic to build
- **THEN** it returns a numbered shortlist of candidate exercise topics with rationale
- **AND** no files under `packages/`, `solutions/`, or `docs/` are created or modified

#### Scenario: Candidate list excludes out-of-scope topics
- **WHEN** the agent evaluates candidate topics against
  `docs/LEARNING_PATH.md`'s "Not covered by design" list (render functions, custom
  directives, Transitions, Teleport, Suspense, SSR)
- **THEN** none of those topics appear in the returned shortlist

### Requirement: Coverage is grounded in actual tests, not just documentation
The agent SHALL cross-check `docs/LEARNING_PATH.md`'s "Exam-topic coverage" table
against what `packages/*/tests` actually exercises, and SHALL report any mismatch it
finds (a topic claimed covered with no supporting test, or a topic covered in tests
but absent from the table) as part of its analysis output, rather than silently
trusting or silently correcting the table.

#### Scenario: Table claims coverage the tests don't support
- **WHEN** `docs/LEARNING_PATH.md` lists an exercise against a topic in the
  exam-topic coverage table, but that exercise's `tests/*.spec.ts` contain no
  assertion exercising that topic
- **THEN** the agent's analysis output flags the mismatch by exercise number and topic
  name, in addition to whatever candidates it proposes

### Requirement: Build mode reuses the existing new-exercise contract
When invoked with a specific exercise or topic named in the prompt, the agent SHALL
read `.claude/commands/new-exercise.md` and follow its Files, Wire-up, and Verify
sections using the named topic as that command's `$ARGUMENTS`, rather than following
a separately maintained copy of that contract.

#### Scenario: Invoked with a named exercise to build
- **WHEN** the agent is invoked with a prompt naming a specific exercise topic to
  build (either a topic proposed by its own prior analysis-mode output, or one the
  user specifies directly)
- **THEN** the agent scaffolds `packages/NN-name/` and `solutions/NN-name/` and
  completes all four wire-up points described in `.claude/commands/new-exercise.md`

#### Scenario: new-exercise.md contract is unavailable
- **WHEN** the agent is invoked in build mode but `.claude/commands/new-exercise.md`
  cannot be read
- **THEN** the agent reports that the scaffolding contract is missing and stops
  without writing any exercise files

### Requirement: Verify sequence runs after scaffolding and failures are reported
After scaffolding a new exercise, the agent SHALL run the same verify sequence
`.claude/commands/new-exercise.md` specifies (install, exercise tests red for the
right reason, exercise typecheck clean while red, solution tests green, solution
typecheck clean, `sync:tests` then `sync:tests:check`, `check`) and SHALL report the
resulting slug, test count, and any step that did not pass — it SHALL NOT report the
exercise as complete if any verify step failed.

#### Scenario: A verify step fails
- **WHEN** any step of the verify sequence does not pass after scaffolding (e.g. the
  exercise typecheck is not clean, or `sync:tests:check` reports drift)
- **THEN** the agent's final report names the specific failing step
- **AND** the agent does not claim the exercise is complete
