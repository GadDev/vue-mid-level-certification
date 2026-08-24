## 1. Settle the skeleton (do these three first)

These three are chosen deliberately: 01 is single-concept, 06 is the worst
multi-concept case (four APIs), 29 is the debug genre. If the skeleton survives all
three it survives the other 27. **Stop and review after 1.4 before continuing.**

- [x] 1.1 Write `docs/lessons/01-scroll-to-item.md` — *"Reaching the real DOM from
      Vue"*. Primary: template refs and the render-then-measure rule. Naive attempt:
      `document.querySelector` (three concrete failure modes). Then `ref=` + typed
      null-check, `useTemplateRef` (3.5+), function refs for `v-for` on a generic
      3-item list, and `await nextTick()` shown failing then passing. Owns: template
      refs / nextTick.
- [x] 1.2 Write `docs/lessons/06-base-input.md` — *"Building a component the parent
      still owns"*. Primary: `defineModel`, opening with the failing attempt to mutate
      a prop. `## You'll also meet`: typed props & emits, `$attrs` fallthrough with
      `defineOptions({ inheritAttrs: false })`, `useId`. Owns: `defineModel`, typed
      props & emits, `useId`.
- [x] 1.3 Write `docs/lessons/29-debug-reactivity.md` — *"Why reactive code stops
      working"*. The three failure modes generically (destructured `reactive()`, a
      `computed` doing a side effect, a `watch` missing `deep`), the shared symptom
      ("renders once, then goes stale"), and the method: read the dependency graph,
      not the logic. Must not identify which one is in `packages/29-debug-reactivity`.
- [x] 1.4 Review the three against `design.md` D1/D2/D7 — section order, the spoiler
      prohibitions, and copy-paste-runnable snippets — and adjust the skeleton once,
      here, before writing 27 more.

## 2. Batch 1 — fundamentals

- [x] 2.1 `docs/lessons/02-shopping-list.md` — *"State that describes the UI vs. state
      that describes the data"*. Owns: view state vs domain state (`editingId` +
      `draft` as view state, items as domain data — on a generic list, not the
      shopping list). Also: reactive array CRUD.
- [x] 2.2 `docs/lessons/03-search-users.md` — *"`computed`, and why not a method"*.
      Owns: computed as cached derivation. Show a method re-running versus a computed
      caching until a dependency changes. Also: `v-model` on a text input.
- [x] 2.3 `docs/lessons/04-sort-products.md` — *"Sorting without breaking your
      source"*. Owns: immutability and comparators. Naive attempt: `arr.sort()` inside
      a `computed`, shown mutating the shared source. Then `[...arr].sort()`, numeric
      vs lexicographic comparison, deterministic tie-breaking.
- [x] 2.4 `docs/lessons/05-counter-history.md` — *"Your first `useX()` composable"*.
      Owns: composable factories. Why module-level state is a bug, returning a
      read-only `ComputedRef`, computed guards, and testing a composable without
      mounting anything.

## 3. Batch 2 — composition & ecosystem

- [x] 3.1 `docs/lessons/07-data-table-slots.md` — *"Letting the caller decide what
      renders"*. Owns: named slots, scoped slots, fallback content, and generics.
      Also: `defineSlots`.
- [x] 3.2 `docs/lessons/08-theme-provider.md` — *"Passing data down without props"*.
      Owns: `provide`/`inject` and a typed `InjectionKey` (show the plain-string key
      yielding `unknown` first), plus app-level state via a plugin's `install()`.
- [x] 3.3 `docs/lessons/09-router-master-detail.md` — *"Why `/users/2` doesn't re-run
      your `setup()`"*. Owns: route params with component reuse, and route guards +
      `meta`. Naive attempt: reading `route.params.id` into a plain `const`. Also:
      lazy route components, injectable history for tests.
- [x] 3.4 `docs/lessons/10-pinia-cart.md` — *"Shared state that survives
      destructuring"*. Owns: Pinia setup stores and `storeToRefs` — naive attempt:
      `const { total } = useCartStore()`. Also: getters, actions, one pinia instance
      per test. Mention float rounding briefly and link forward to lesson 26.
- [x] 3.5 `docs/lessons/11-async-search.md` — *"Async work that keeps changing its
      mind"*. Owns: `watch` cleanup, debounce, and stale-response races. Four failure
      modes, each shown: debouncing after the request, no abort, aborting but still
      accepting the resolved response, treating `AbortError` as an error.
- [x] 3.6 `docs/lessons/12-composable-storage.md` — *"Composables that clean up after
      themselves"*. Owns: `effectScope`/`onScopeDispose`, deep `watch`, and SSR guards.
      Also: `shallowRef` for an always-replaced value.

## 4. Batch 3 — component patterns

- [x] 4.1 `docs/lessons/13-accordion.md` — *"One open at a time, by construction"*.
      Primary: making an invariant unrepresentable (one `openId`, not a boolean per
      section) — links back to lesson 02. `## You'll also meet`: the ARIA contract for
      a disclosure widget. **That subsection is the repo's owner for ARIA contracts**
      (14/16/17 link to it), so give it enough substance to be linkable — heading
      `### The ARIA contract`, and prefer `v-if` where absence is asserted.
- [x] 4.2 `docs/lessons/14-tabs.md` — *"When the list changes under the selection"*.
      Owns: derived-not-stored selection, and `watch` on props (links to 11). Show a
      stored id going dangling when its tab is removed.
- [x] 4.3 `docs/lessons/15-dynamic-form.md` — *"Rendering a form you didn't write"*.
      Owns: schema-driven rendering and control dispatch (`v-if`/`v-else-if` on
      `type`), plus validation timing (nothing shows before the first submit attempt).
      Links to 06 for `useId` and typed props. Also: re-seeding a model when the
      schema prop changes.
- [x] 4.4 `docs/lessons/16-rating.md` — *"Two pieces of state that look like one"*.
      Owns: preview vs committed state. Opens by linking to 06 for `defineModel` and
      stating what is newly hard. Also: keyboard support, and the ARIA slider role
      (link to 13).
- [x] 4.5 `docs/lessons/17-modal.md` — *"Fallback content, and listeners that die with
      the component"*. Primary: listener lifecycle — added on mount, removed when the
      component unmounts, not when the app does. Links to 07 for slots. Also:
      `@click.self`, and the ARIA dialog contract (link to 13).

## 5. Batch 4 — stateful UI & composables

- [x] 5.1 `docs/lessons/18-notification-queue.md` — *"One timer per item, all of them
      yours"*. Owns: timer ownership. Each timer cancellable individually and all of
      them cancelled when the scope dies. Links to 05 and 12.
- [x] 5.2 `docs/lessons/19-pagination.md` — *"Clamping is a derivation, not an
      assignment"*. Owns: generic composables and clamp-on-read. Naive attempt: a
      `watch` assigning the page back into range, fighting a `computed`. Links to 03
      and 07.
- [x] 5.3 `docs/lessons/20-infinite-scroll.md` — *"The second call that shouldn't
      happen"*. Owns: the in-flight guard and terminal states (no-more-data, and an
      error you can retry from). Links to 08 for the injected loader.
- [x] 5.4 `docs/lessons/21-use-countdown.md` — *"Owning `setInterval`"*. Owns: the
      double-start guard and interval-dies-with-the-scope. Links to 12 and 18.
      **Note:** `shared/exercise-shell`'s timer is a spoiler for exercise 21 — do not
      reference or excerpt it in this lesson.
- [x] 5.5 `docs/lessons/22-use-fetch.md` — *"The request state machine"*. Owns: the
      full state machine, a per-instance cache, and the request ticket (a cached key
      must not flip `loading`; a retry bypasses the cache). Links to 11 and 05.
- [x] 5.6 `docs/lessons/23-clipboard.md` — *"APIs that might not be there"*. Owns:
      feature detection and injected side effects. Links to 12, 08 and 18.

## 6. Batch 5 — ecosystem at scale

- [x] 6.1 `docs/lessons/24-pinia-wishlist.md` — *"Getters that take an argument"*.
      Owns: a getter returning a function rather than a precomputed set. Links to 10,
      to 12 for deep `watch`, and forward to 26 for defensive parsing.
- [x] 6.2 `docs/lessons/25-pinia-auth-guard.md` — *"The store knows who; the router
      decides where"*. Owns: a global `beforeEach` with route `meta`, and the redirect
      round-trip. Links to 09 and 10.
- [x] 6.3 `docs/lessons/26-dashboard-stats.md` — *"Trusting nothing on the way in"*.
      Owns: defensive parsing with a type predicate, and rounding. Links back from 10
      and 24. Also: getters as pure derivations (links to 03).
- [x] 6.4 `docs/lessons/27-query-filters.md` — *"The URL is the state"*. Owns: the URL
      as the only state — normalising `route.query` (missing, repeated, zero,
      negative, non-numeric), keeping defaults out of the URL. Links to 09 and 26.
- [x] 6.5 `docs/lessons/28-breadcrumbs.md` — *"Never hand-write a breadcrumb trail"*.
      Owns: `route.matched` and route `meta` as a source for generated UI, including
      param interpolation. Links to 09 and 25.

## 7. Batch 6 — debugging

- [x] 7.1 `docs/lessons/30-debug-emits-store.md` — *"Contracts that look fine until
      there are two"*. The `v-model` event-name contract between parent and child, and
      state in module scope versus inside a setup store. Shared symptom: correct with
      one instance, wrong with two. Must not identify which failure is in
      `packages/30-debug-emits-store`. Links to 06 and 10.

## 8. Index and site wiring (after all 30 pages exist)

- [x] 8.1 Write `docs/lessons/index.md` — a table of all 30: number, lesson title,
      primary concept, link to the lesson, link to the exercise. Open with the
      lesson-vs-PATTERNS-vs-LEARNING_PATH division of labour (design.md D4) so a
      reader knows which door to use.
- [x] 8.2 `docs/.vitepress/config.mts`: add `{ text: 'Lessons', link: '/lessons/' }`
      to `nav`, and add a `sidebar` key (the site currently has none) with a
      `/lessons/` entry grouped into the six batches.
- [x] 8.3 `docs/PATTERNS.md`: add a `**Lesson**: NN` line beside each section's
      existing `**See**: Exercise NN`, per design.md D4. Sections with no lesson
      counterpart are left alone.
- [x] 8.4 Add a "Before you start" link to each `packages/<slug>/README.md`, placed
      before `## Prompt` (30 files). Expect this to trigger one full CI solution-suite
      run — it is inside `packages/`.
- [x] 8.5 Root `README.md`: add a Lesson column to the exercise table.
- [x] 8.6 `CLAUDE.md`: note in Repo state that every exercise has a lesson at
      `docs/lessons/<slug>.md`, that lessons stop at the spoiler line while
      `LEARNING_PATH.md`'s bullets do not, and that `docs/lessons/` is inside CI's
      four-directory fence.

## 9. Authoring contract

These are slash **commands**, not skills — `.claude/commands/new-exercise.md` and
`.claude/commands/review-exercise.md`. `.claude/skills/` holds only the openspec and
blog skills. Edit the command files; do not create a shadowing skill copy of the
authoring contract (the in-progress `add-exercise-gap-agent` change reads
`.claude/commands/new-exercise.md` as the single source of that contract).

- [x] 9.1 `.claude/commands/new-exercise.md`: add a Files/Wire-up step that writes the
      new exercise's lesson, registers it in `docs/lessons/index.md` and the VitePress
      sidebar, and adds the README "Before you start" link — including the skeleton
      (D1) and the spoiler prohibitions (D2) inline, so the command stays
      self-contained. Note that `add-exercise-gap-agent`'s build mode inherits this
      step for free by following this file.
- [x] 9.2 `.claude/commands/review-exercise.md`: add a check that the exercise's lesson
      exists, uses the skeleton in order, and crosses none of D2's four prohibitions
      (`data-testid` values, hidden edge cases, test count, exercise domain objects).

## 10. Verification

- [x] 10.1 Set equality: `packages/*/` directory names == `docs/lessons/*.md`
      filenames minus `index.md`. No orphans either direction.
- [x] 10.2 Spoiler sweep: grep every lesson for the `data-testid` values its
      exercise's spec selects on, and for each phrase in its README's "Hidden edge
      cases" section. Zero hits required.
- [x] 10.3 Skeleton sweep: every lesson has the H1 + prep blockquote and its H2s in
      the required order; `## You'll also meet` present exactly where the exercise
      teaches more than one concept.
- [x] 10.4 Ownership sweep: for each concept in design.md D3, confirm exactly one
      lesson explains it in full and every revisit links back.
- [x] 10.5 Snippet sweep (manual, per D7): every code block is a complete runnable SFC
      or module, except blocks explicitly introduced as the failing naive attempt.
      Confirm the naive attempts are labelled as broken in prose.
- [x] 10.6 `pnpm docs:build` succeeds; nav and `/lessons/` sidebar render; local search
      finds a lesson page. Confirm no *new* dead-link class beyond the `../` pattern
      `ignoreDeadLinks` already covers.
- [x] 10.7 `pnpm check` clean and `pnpm sync:tests:check` clean (neither should be
      affected — this change touches no `src/` or `tests/`).
- [x] 10.8 Confirm no `packages/*/src/**` or `packages/*/tests/**` file is modified by
      this change, and that no exercise's test count or time budget changed.
