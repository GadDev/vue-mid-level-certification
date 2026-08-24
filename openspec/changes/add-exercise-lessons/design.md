## Context

The repo has three documentation layers and a gap where prep material would go:

```
packages/NN/README.md   WHAT to build + the DOM contract        per-exercise
docs/PATTERNS.md        HOW the idiom works (43KB reference)    per-concept, by batch
docs/LEARNING_PATH.md   WHY the exercise exists (one bullet)    per-exercise, post-hoc
docs/lessons/NN.md      ← this change                            per-exercise, pre-hoc
```

The risk that dominated exploration: a "concept primer" is very close to what
`PATTERNS.md` already contains. Its `Template Refs to Access DOM Elements` section
(`docs/PATTERNS.md:238`) already covers refs, null-until-mount, `useTemplateRef`,
function refs for `v-for`, the `nextTick` rule, and ends with `See: Exercise 01`. The
primer's *content* is largely written; what is missing is the *pedagogy* — motivation
before API, a naive attempt shown failing, one idea per section, prose aimed at someone
who does not yet have the vocabulary. If that distinction is not enforced structurally,
the two files decay into near-duplicates that drift.

Decisions taken during exploration (`/opsx:explore`, 2026-08-24): lessons live in
`docs/lessons/`, all 30 land in one change, 29 and 30 each get their own lesson, and
the depth is **concept primer with generic examples** rather than a walkthrough of the
exercise or an analogous toy problem.

## Goals / Non-Goals

**Goals**
- A beginner can read one page and then start the exercise without reverse-engineering
  the API from a failing test suite.
- Lessons stay valid when an exercise's tests change, because they describe concepts,
  not that exercise's requirements.
- Zero new duplication: a concept is explained in exactly one lesson.
- The prep layer is part of the exercise-authoring contract, not a one-off doc sprint.

**Non-Goals**
- Not a replacement for `PATTERNS.md`. Not a rewrite of `LEARNING_PATH.md`.
- Not a solution guide. No lesson shows an exercise's implementation, its
  `data-testid` contract, or its hidden edge cases.
- Not making exercises easier. Time budgets and test suites are untouched; the lesson
  removes *blank-page paralysis*, not the work.
- Not a tutorial series with narrative continuity — each lesson is readable alone.

## Decisions

### D1 — Lesson skeleton is fixed

Every lesson uses the same five sections, in this order:

```markdown
# Lesson NN — <concept-facing title, not the exercise title>

> Prep for Exercise NN. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem
Why this is hard / why the obvious approach fails. No Vue API yet.

## The main idea
The primary concept. Show the naive attempt failing FIRST, then the idiom.
Small, neutral examples — never the exercise's own material.

## You'll also meet
Secondary concepts, 2-4 paragraphs + one snippet each. Omit if there are none.

## Reference
→ docs/PATTERNS.md §<section>  (the terse form, for later lookup)
→ Earlier lessons this builds on

## Now do Exercise NN
One line. No hints.
```

**Why fixed:** the skeleton *is* the pedagogy. "Problem before API" and "naive attempt
before idiom" are exactly what `PATTERNS.md` does not do, so encoding them in the
structure is what keeps the two files from converging. It also makes the
`review-exercise` spoiler check mechanical rather than a judgement call.

**Length target:** 150–250 lines. A lesson pushing past 300 is a signal that D3 was
violated — a concept is being re-explained that an earlier lesson owns.

### D2 — The spoiler line

Three bands, and the lesson occupies only the first:

```
   API + mental model        exercise's edge cases       the solution
   ─────────────────────     ──────────────────────      ────────────
   what a ref is             the timer-restart trap      ScrollList.vue
   when it's null            whitespace validation
   function refs in v-for    one-highlight-at-a-time
   the nextTick rule

   ├──── LESSON ────┤ ────────── off limits ──────────────────────────┤
```

Concretely, a lesson MUST NOT mention: any `data-testid` from the exercise's DOM
contract, anything from the README's "Hidden edge cases" section, the exercise's test
count, or the exercise's specific domain objects (no 20-item list in lesson 01, no
cart totals in lesson 10).

**Consequence, and why this band was chosen:** it keeps the maintenance cost at one
file per concept instead of four. If lessons covered edge cases, changing an exercise's
spec would mean editing the spec, the README, the LEARNING_PATH bullet *and* the
lesson. Bounded at the API surface, a lesson is about `defineModel`, not about
exercise 06 — so it survives exercise churn and can be shared per D3.

### D3 — First mention owns the concept

~21 concepts span 30 exercises. The lesson for the **earliest** exercise that meets a
concept explains it in full; every later lesson links back and states only what is
newly hard.

```
concept                          owned by   revisited by
───────────────────────────────  ────────   ──────────────────────
template refs / nextTick            01      —
view state vs domain state          02      13, 14, 16
computed as cached derivation       03      04, 19, 26
immutability & comparators          04      —
composable factories                05      12, 18, 19, 20, 21, 22, 23
typed props & emits                 06      13, 15
defineModel                         06      16
useId                               06      15
slots: named, scoped, fallback      07      17
generics (component & composable)   07      19
provide / inject                    08      20, 23
app-level state via a plugin        08      —
router params & component reuse     09      27, 28
route guards & meta                 09      25, 28
Pinia setup stores & storeToRefs    10      24, 25, 26, 30
watch cleanup, debounce, races      11      14, 22
effectScope / onScopeDispose        12      18, 21, 23
deep watch                          12      24
SSR guards & feature detection      12      23
ARIA contracts for widgets          13      14, 16, 17
timer ownership                     18      21, 23
defensive parsing & rounding        26      10, 24, 27
```

A revisit opens like this, and skips straight to `## The main idea`:

> You met `defineModel` in [Lesson 06](./06-base-input.md). Here it is harder,
> because there are two pieces of state and the model owns only one of them.

**Note on the last row:** rounding is first met in 10 and parsing in 24, but 26 is the
exercise *about* derivation-with-defensive-parsing. Lesson 26 owns the full treatment;
10 and 24 mention rounding/parsing inline within their own primary concept and link
forward. This is the one place ownership is not strictly chronological, and it is
deliberate — recorded here so it does not read as an error.

### D4 — Division of labour with PATTERNS.md, made bidirectional

|          | Lesson                              | PATTERNS section                |
|----------|-------------------------------------|---------------------------------|
| audience | has never seen this                 | knows it, forgot the syntax     |
| order    | problem → failing attempt → idiom   | API → snippet → `See: Ex NN`    |
| length   | 150–250 lines, prose-heavy          | 30–60 lines, terse              |
| examples | one build-along scenario            | minimal isolated snippet        |
| links    | → PATTERNS + earlier lessons        | → `Lesson: NN`, `See: Exercise NN` |

The `Lesson: NN` back-link added to each PATTERNS section is what makes the split
survive: a future editor extending PATTERNS sees immediately that a beginner-facing
page exists and does not start writing prose into the catalogue.

### D5 — Lessons 29 and 30 teach the failure *family*, not the bug

The debug exercises ship `src/` complete but wrong, so "the concept to implement" does
not exist. D2's spoiler line resolves this cleanly: a lesson can teach the whole family
of reactivity-loss failures without naming which member is hiding in the file.

- **Lesson 29 — Why reactive code stops working.** The destructure that loses
  reactivity; a `computed` doing work that belonged in a `watch`; a `watch` that never
  fires on a nested change. The shared symptom — *renders once, then goes stale* — and
  the method: read the dependency graph, not the logic.
- **Lesson 30 — Contracts that look fine until there are two.** The `v-model`
  event-name contract between parent and child, and state declared in module scope
  versus inside a setup store. The shared symptom: correct with one instance, wrong
  with two.

Both are generic, both are useful, and neither says which of its three failure modes is
the one in `packages/29-debug-reactivity/src`. `PATTERNS.md`'s batch-6 section currently
has a single entry, so these lessons also fill the repo's thinnest documentation area.

### D6 — Multi-concept exercises get one primary + short secondaries

Several exercises are not one concept (06 teaches four, 12 teaches five). A single
beginner-paced page covering five APIs is no longer beginner-paced. The
`## You'll also meet` section absorbs the secondaries at 2–4 paragraphs and one snippet
each; the primary concept keeps the full problem-then-failure-then-idiom treatment.
Primary concept per exercise is fixed in `tasks.md` so it is not re-litigated per file.

### D7 — Assumed: snippets stay unverified, README links ship

Two questions were left open at the end of exploration. Assumptions taken so the change
is complete rather than blocked — both are cheap to reverse:

- **Snippets are hand-reviewed, not machine-checked.** Biome lints only
  `packages/**`, `solutions/**`, `shared/**`, so ~120 lesson snippets are unverified,
  and a wrong snippet in a *beginner* page miseducates confidently rather than merely
  confusing. Accepted for parity with `PATTERNS.md`, which already carries this risk.
  Mitigation now: every snippet must be copy-paste-runnable as a complete
  `<script setup lang="ts">` SFC or a complete `.ts` module — no elided bodies, no
  pseudo-code. Recorded as a follow-up (see Open Questions), not built here.
- **The 30 README "Before you start" links ship**, despite being dead in the deployed
  site. Most readers meet an exercise through its README in the repo, where the link
  works; the lesson page remains the canonical copy for the site.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Lessons converge with `PATTERNS.md` over time | D1's fixed skeleton + D4's bidirectional cross-links; the review skill checks the skeleton is intact |
| A lesson drifts past the spoiler line | D2 lists the four concrete prohibitions; `review-exercise` gains a check for them |
| 30 unverified snippets teach something wrong | D7's copy-paste-runnable rule; PATTERNS carries the same risk today |
| All 30 in one change means a template mistake repeats 30× | Author 01, 06 and 29 first (one simple, one multi-concept, one debug) and settle the skeleton before the remaining 27 — encoded as task phase ordering |
| The `packages/*/README.md` sweep triggers a full solution suite in CI | One-time, expected, documented in the proposal |
| Exercise 31 ships without a lesson | `new-exercise` skill gains a lesson step; `review-exercise` gains the spoiler check |
| Lessons make exercises easier than the exam | D2 keeps every hidden edge case undiscussed — the discovery work that the time budgets are calibrated against is exactly what the lesson does not cover |

## Migration Plan

Additive; nothing to migrate. Author the three template-setting lessons first (01, 06,
29), settle the skeleton, then fan out batch by batch, then wire up the site, the
READMEs and the skills last so the cross-links point at pages that exist.

## Open Questions

- Should lesson snippets eventually live in a typechecked `shared/lesson-examples/`
  tree and be embedded via VitePress snippet includes? That is the difference between
  "docs" and verified teaching material. Deferred by D7; revisit if a wrong snippet is
  ever found in review.
- Should `docs/ANTI_PATTERNS.md` (currently only batches 1–2, AP-1…AP-9) become the
  fourth cross-reference in the `## Reference` section once batches 3–6 are written?
  Left out for now to avoid links into a mostly-empty document.
