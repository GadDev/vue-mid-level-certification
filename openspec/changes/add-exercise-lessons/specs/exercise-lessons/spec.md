## ADDED Requirements

### Requirement: Every exercise has exactly one lesson page
The repository SHALL contain a lesson at `docs/lessons/<slug>.md` for every exercise
directory `packages/<slug>/`, where `<slug>` matches the package directory name
exactly, and SHALL contain no lesson file that has no corresponding exercise. A
`docs/lessons/index.md` SHALL list all lessons with the exercise number, the lesson's
primary concept, and a link to the exercise.

#### Scenario: A lesson exists for each exercise
- **WHEN** the set of `packages/*/` directory names is compared with the set of
  `docs/lessons/*.md` filenames, excluding `index.md`
- **THEN** the two sets are identical

#### Scenario: A new exercise is added
- **WHEN** a new exercise is scaffolded into `packages/` and `solutions/`
- **THEN** a lesson page for it exists at `docs/lessons/<slug>.md` and is listed in
  `docs/lessons/index.md`

### Requirement: Lessons follow the fixed skeleton
Each lesson SHALL open with an H1 of the form `# Lesson NN — <title>` followed by a
blockquote stating that the page is prep for Exercise NN and does not discuss the
exercise's edge cases or solution, and SHALL contain the sections `## The problem`,
`## The main idea`, `## Reference`, and `## Now do Exercise NN` in that order. A
`## You'll also meet` section SHALL appear between `## The main idea` and
`## Reference` when the exercise teaches more than one concept, and SHALL be omitted
otherwise. `## The main idea` SHALL present a failing naive attempt before presenting
the idiom.

#### Scenario: Lesson section order
- **WHEN** any `docs/lessons/NN-*.md` is read
- **THEN** its H2 headings appear in the order `The problem`, `The main idea`,
  optionally `You'll also meet`, `Reference`, `Now do Exercise NN`

#### Scenario: The failing attempt comes first
- **WHEN** `docs/lessons/04-sort-products.md`'s `## The main idea` section is read
- **THEN** its first code block is the mutating `arr.sort()` attempt, introduced by
  prose identifying it as broken, and the `[...arr].sort()` form follows it

### Requirement: Lessons stop at the spoiler line
A lesson SHALL teach the API surface and mental model of its concepts using small,
neutral examples, and SHALL NOT contain any of the following: a `data-testid` value
from its exercise's DOM contract, any item listed in its exercise README's "Hidden edge
cases" section, its exercise's test count, or its exercise's specific domain objects.

#### Scenario: Lesson examples use neutral material
- **WHEN** lesson 01 demonstrates function refs in a `v-for`
- **THEN** the example uses generic material rather than the exercise's 20-item
  scrollable list

#### Scenario: Hidden edge cases stay undiscussed
- **WHEN** `packages/01-scroll-to-item/README.md` lists the timer-restart trap under
  "Hidden edge cases"
- **THEN** `docs/lessons/01-scroll-to-item.md` does not explain or mention it

#### Scenario: The DOM contract is not restated
- **WHEN** any lesson is searched for the `data-testid` values used by its exercise's
  spec
- **THEN** none are present

### Requirement: A concept is explained in full by exactly one lesson
A concept shared by two or more exercises SHALL be explained in full by exactly one
lesson — the one designated its owner — and every other lesson covering that concept
SHALL link to the owning lesson and describe only what is newly difficult in its own
context, rather than re-explaining the concept.

#### Scenario: A revisited concept links back
- **WHEN** `docs/lessons/16-rating.md` covers `defineModel`, which
  `docs/lessons/06-base-input.md` owns
- **THEN** lesson 16 links to lesson 06 and explains only what is harder in 16, rather
  than re-introducing `defineModel` from scratch

#### Scenario: Ownership is unambiguous
- **WHEN** a lesson is authored for a concept already owned by an earlier lesson
- **THEN** the ownership table in this change's `design.md` determines the owner, and
  no second full explanation is written

### Requirement: Lessons and PATTERNS cross-reference each other
Each lesson's `## Reference` section SHALL link to the `docs/PATTERNS.md` section(s)
covering its concepts, and each `docs/PATTERNS.md` section that a lesson references
SHALL carry a `Lesson: NN` line alongside its existing `See: Exercise NN` line.

#### Scenario: Round-trip cross-reference
- **WHEN** `docs/lessons/01-scroll-to-item.md` links to
  `docs/PATTERNS.md` § "Template Refs to Access DOM Elements"
- **THEN** that PATTERNS section carries a `Lesson: 01` reference back

### Requirement: Debug-exercise lessons teach the failure family, not the bug
The lessons for the debug-style exercises (29, 30) SHALL teach the family of failure
modes their exercise draws from, together with the shared symptom and a reading method,
and SHALL NOT identify which failure mode is present in that exercise's `src/`.

#### Scenario: Lesson 29 stays general
- **WHEN** `docs/lessons/29-debug-reactivity.md` describes lost reactivity from
  destructuring, a `computed` doing a side effect, and a `watch` missing `deep`
- **THEN** it does not state which of these `packages/29-debug-reactivity/src` contains

### Requirement: Lessons are reachable from the docs site and the exercise
`docs/.vitepress/config.mts` SHALL expose a `Lessons` nav entry linking to `/lessons/`
and a sidebar for `/lessons/` grouped by the six batches, and each
`packages/<slug>/README.md` SHALL link to its lesson before the exercise prompt.

#### Scenario: Site navigation
- **WHEN** the VitePress site is built
- **THEN** `/lessons/` is reachable from the nav and every lesson page appears in the
  `/lessons/` sidebar under its batch

#### Scenario: Exercise points at its lesson
- **WHEN** a reader opens `packages/06-base-input/README.md`
- **THEN** a link to `docs/lessons/06-base-input.md` appears before the prompt

### Requirement: Lesson snippets are complete and runnable as written
Every code block in a lesson SHALL be a complete, copy-paste-runnable
`<script setup lang="ts">` single-file component or a complete TypeScript module,
except where the block is explicitly labelled as the failing naive attempt being
demonstrated. Elided bodies, `...` placeholders, and pseudo-code SHALL NOT appear.

#### Scenario: A snippet is read in isolation
- **WHEN** any lesson code block is copied into an empty `.vue` or `.ts` file
- **THEN** every identifier it uses is either imported in the block or declared in it,
  and no `...` placeholder or elided body appears

#### Scenario: A deliberately broken snippet
- **WHEN** a lesson shows a naive attempt that does not work
- **THEN** the block is introduced by prose identifying it as the broken version and
  is followed by the working form

### Requirement: Authoring a new exercise includes authoring its lesson
The `new-exercise` command SHALL include a step that creates the exercise's lesson page
and registers it in `docs/lessons/index.md` and the VitePress sidebar, and the
`review-exercise` command SHALL include a check that the exercise's lesson exists,
follows the skeleton, and does not cross the spoiler line. The authoring contract SHALL
remain in a single place — `.claude/commands/new-exercise.md` — rather than being
copied into a second definition.

#### Scenario: Scaffolding a new exercise
- **WHEN** `new-exercise` completes for a new exercise
- **THEN** `docs/lessons/<slug>.md` exists, is listed in `docs/lessons/index.md`, and
  appears in the sidebar

#### Scenario: Reviewing an exercise
- **WHEN** `review-exercise` runs against an exercise whose lesson mentions a hidden
  edge case
- **THEN** the review reports the spoiler-line violation
