# Vue Mid-Level Certification Practice

[![CI](https://github.com/GadDev/vue-mid-level-certification/actions/workflows/ci.yml/badge.svg)](https://github.com/GadDev/vue-mid-level-certification/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/GadDev/vue-mid-level-certification)

A practical **Vue 3 + TypeScript** training repository, built to cover the mid-level Vue.js certification exam: 30 multiple-choice questions + 105 minutes of coding challenges. Thirty exercises in six batches — Batch 1 (01–05) drills the fundamentals inside a single component; Batch 2 (06–12) covers component composition and the ecosystem, which is where the coding block actually lives; Batches 3–5 (13–28) go wider on component patterns, composables that own side effects, and Pinia + Router at scale; Batch 6 (29–30) is the exam's bug-fixing challenge.

> These are original practice exercises designed to resemble the style and difficulty of a mid-level Vue assessment. They are not copied from or leaked from any certification exam.

**How it works**: every exercise ships with a **full test suite that starts red**. The tests are the spec — each exercise README documents the DOM contract they drive. Your job is to make them green without editing them. `solutions/` holds a reference implementation that passes the same specs.

## Resources

- **[Vue.js Certification](https://certificates.dev/vuejs)** — the certificate this repository is training toward
- **[Vue School](https://vueschool.io/)** — video courses that pair well with the exercises here
- **[Vue.js Guide](https://vuejs.org/guide/introduction.html)** — the official docs; the primary reference for anything an exercise doesn't explain

Every exercise row below has a `▶` link that opens this repo on StackBlitz, focused on that exercise's `App.vue`. It boots the whole workspace (needed because every exercise depends on `@practice/exercise-shell` via `workspace:*`) — once it's installed, run `pnpm dev:NN` in the StackBlitz terminal for that exercise's dev server.

## Exercises — Batch 1: fundamentals

| #   | Exercise                                                 | Main skills                                       | Tests |
| --- | -------------------------------------------------------- | ------------------------------------------------- | ----- |
| 01  | [Scroll to Item](packages/01-scroll-to-item/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/01-scroll-to-item/src/App.vue))   | template refs, DOM APIs, `nextTick`, validation   | 16    |
| 02  | [Shopping List](packages/02-shopping-list/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/02-shopping-list/src/App.vue))     | reactive CRUD, inline editing, view vs domain state | 14  |
| 03  | [Search Users](packages/03-search-users/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/03-search-users/src/App.vue))       | `computed`, `v-model`, filtering, empty states     | 15   |
| 04  | [Sort Products](packages/04-sort-products/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/04-sort-products/src/App.vue))     | computed caching, immutability, comparators        | 9    |
| 05  | [Counter History](packages/05-counter-history/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/05-counter-history/src/App.vue)) | composables, encapsulated state, undo/redo         | 20   |

Batch 1 deliberately stays inside a single component.

## Exercises — Batch 2: composition & ecosystem

This is where the mid-level exam's 105-minute coding block actually lives: multiple components, a contract between them, and the ecosystem around them.

| #   | Exercise                                                            | Main skills                                                        | Tests |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------ | ----- |
| 06  | [Base Input & Form Contract](packages/06-base-input/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/06-base-input/src/App.vue))       | typed props/emits, `defineModel`, `$attrs` fallthrough, validation  | 20    |
| 07  | [Data Table with Slots](packages/07-data-table-slots/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/07-data-table-slots/src/App.vue))      | named + scoped slots, fallbacks, `defineSlots`, generic components   | 17    |
| 08  | [Theme Provider](packages/08-theme-provider/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/08-theme-provider/src/App.vue))               | provide/inject, typed `InjectionKey`, Vue plugins                    | 11    |
| 09  | [Router Master / Detail](packages/09-router-master-detail/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/09-router-master-detail/src/App.vue)) | routes, params, `beforeEnter`, lazy routes, component reuse          | 11    |
| 10  | [Pinia Cart](packages/10-pinia-cart/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/10-pinia-cart/src/App.vue))                       | setup stores, getters, actions, `storeToRefs`, shared state          | 28    |
| 11  | [Async Search](packages/11-async-search/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/11-async-search/src/App.vue))                   | `watch`, `onWatcherCleanup`, debounce, `AbortController`, races      | 20    |
| 12  | [Composables with Cleanup](packages/12-composable-storage/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/12-composable-storage/src/App.vue)) | `onScopeDispose`, event cleanup, `shallowRef`, deep watch, SSR safety | 18    |

## Exercises — Batch 3: component patterns

The reusable UI primitives an interviewer reaches for: one source of truth for view state, a keyboard contract, and the ARIA attributes that go with them.

| #   | Exercise                                                | Main skills                                                       | Tests |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------- | ----- |
| 13  | [Accordion](packages/13-accordion/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/13-accordion/src/App.vue))            | single-source view state, conditional rendering, typed props & emits, ARIA | 10 |
| 14  | [Dynamic Tabs](packages/14-tabs/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/14-tabs/src/App.vue))              | derived selection, `watch` on props, list refresh, ARIA state       | 11    |
| 15  | [Dynamic Form](packages/15-dynamic-form/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/15-dynamic-form/src/App.vue))      | schema-driven rendering, control type dispatch, validation timing, `useId` | 12 |
| 16  | [Rating](packages/16-rating/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/16-rating/src/App.vue))                  | `defineModel`, preview vs committed state, keyboard support, ARIA slider | 15 |
| 17  | [Modal](packages/17-modal/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/17-modal/src/App.vue))                    | slots with fallbacks, scoped slots, `.self` modifier, listener lifecycle | 14 |

## Exercises — Batch 4: stateful UI & composables

A second pass at composables, harder than 05/11/12: each one owns a timer, a request, or a browser API, and has to give it back.

| #   | Exercise                                                        | Main skills                                                     | Tests |
| --- | ---------------------------------------------------------------- | --------------------------------------------------------------- | ----- |
| 18  | [Notification Queue](packages/18-notification-queue/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/18-notification-queue/src/App.vue))  | composable factory, one timer per item, `onScopeDispose`          | 18    |
| 19  | [Pagination](packages/19-pagination/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/19-pagination/src/App.vue))                  | generic composable, derived clamping, page-size reset             | 18    |
| 20  | [Infinite Scroll](packages/20-infinite-scroll/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/20-infinite-scroll/src/App.vue))        | injected loader, in-flight guard, end-of-data detection, recovery | 19    |
| 21  | [`useCountdown()`](packages/21-use-countdown/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/21-use-countdown/src/App.vue))         | interval ownership, guard against double timers, `onScopeDispose` | 22    |
| 22  | [`useFetch()`](packages/22-use-fetch/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/22-use-fetch/src/App.vue))                 | request state machine, per-instance cache, retry, stale responses | 19    |
| 23  | [Clipboard](packages/23-clipboard/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/23-clipboard/src/App.vue))                    | feature detection, injected side effect, timed UI flash           | 15    |

## Exercises — Batch 5: ecosystem at scale

Pinia and Vue Router doing real work together, including the URL as a piece of application state.

| #   | Exercise                                                          | Main skills                                                    | Tests |
| --- | ------------------------------------------------------------------ | -------------------------------------------------------------- | ----- |
| 24  | [Pinia Wishlist](packages/24-pinia-wishlist/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/24-pinia-wishlist/src/App.vue))            | setup store, getter returning a function, deep `watch`, guards   | 18    |
| 25  | [Auth Store & Route Guards](packages/25-pinia-auth-guard/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/25-pinia-auth-guard/src/App.vue)) | Pinia + Router, global `beforeEach`, route meta, redirect round-trip | 21 |
| 26  | [Dashboard Stats](packages/26-dashboard-stats/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/26-dashboard-stats/src/App.vue))          | store getters as derivations, defensive parsing, rounding        | 18    |
| 27  | [Query Filters](packages/27-query-filters/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/27-query-filters/src/App.vue))              | URL as state, `route.query` normalisation, clean URLs            | 16    |
| 28  | [Breadcrumbs](packages/28-breadcrumbs/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/28-breadcrumbs/src/App.vue))                  | `route.matched`, route meta, nested routes, param interpolation   | 10    |

## Exercises — Batch 6: debugging

The certification's bug-fixing challenge. These two invert the format: `src/` is **complete but wrong**, and the work is reading rather than writing.

| #   | Exercise                                                                  | Main skills                                                  | Tests |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------ | ----- |
| 29  | [Debug: Reactivity, Computed & Watch](packages/29-debug-reactivity/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/29-debug-reactivity/src/App.vue)) | reading broken reactive code                              | 15    |
| 30  | [Debug: Emits & Pinia](packages/30-debug-emits-store/README.md) ([▶](https://stackblitz.com/github/GadDev/vue-mid-level-certification?file=packages/30-debug-emits-store/src/App.vue))           | the `v-model` contract, store reactivity, module vs setup scope | 9   |

**479 tests across the six batches**, all red in `packages/`, all green in `solutions/`.

## Requirements

- Node.js 20.19+ (or 22.12+) — Vite 7's floor
- pnpm 10+

## Install

```bash
pnpm install
```

## Commands

```bash
pnpm test              # every package (exercises red, solutions green) — never bails early
pnpm test:exercises    # your work only
pnpm test:solutions    # the reference implementations only
pnpm test:watch        # watch mode
pnpm typecheck         # vue-tsc across every package
pnpm check             # Biome lint + format check
pnpm check:fix         # auto-fix
pnpm build             # build every exercise
```

Per exercise:

```bash
pnpm dev:01 … pnpm dev:30                    # Vite dev server
pnpm --filter 01-scroll-to-item test         # exercise tests
pnpm --filter 01-scroll-to-item-solution test  # solution tests
pnpm --filter @practice/exercise-shell test  # the shared nav bar + timer component
```

## Practice workflow

1. Read **only** the exercise `README.md` in `packages/<exercise>/`.
2. Run the tests first — they are red. Read them if you get stuck; they encode every requirement and edge case.
3. Start the dev server (`pnpm dev:01`) and implement the TODOs.
4. Make every test green, then `pnpm --filter <exercise> typecheck`.
5. Check it manually in the browser.
6. Only then compare with `solutions/<exercise>/`.

Stay inside the time limit printed at the top of each exercise README.

## Tests live in one place

`solutions/*/tests/` is **generated** from `packages/*/tests/` — edit the exercise copy and run:

```bash
pnpm sync:tests         # regenerate the solution copies
pnpm sync:tests:check   # fail if they have drifted
```

## Repository structure

```text
vue-mid-level-certification/
├── packages/<exercise>/        # your work: starter + README + tests (red)
│   ├── src/components/…
│   ├── src/composables/…
│   └── tests/*.spec.ts
├── solutions/<exercise>/       # reference implementation + generated test copies
├── shared/exercise-shell/      # @practice/exercise-shell — nav bar + timer, used by every App.vue
├── docs/
│   ├── SETUP.md
│   ├── LEARNING_PATH.md
│   └── PATTERNS.md
├── scripts/sync-tests.sh
└── tsconfig.base.json          # strict TS, shared by every package
```

## Learning & troubleshooting

- **[SETUP.md](docs/SETUP.md)** — environment setup and troubleshooting
- **[LEARNING_PATH.md](docs/LEARNING_PATH.md)** — skill progression and exam-topic coverage
- **[PATTERNS.md](docs/PATTERNS.md)** — Vue 3 Composition API patterns used throughout
- **[ANTI_PATTERNS.md](docs/ANTI_PATTERNS.md)** — the near-miss version of each pattern above

These four are also published as a browsable site: **https://GadDev.github.io/vue-mid-level-certification/**. To run it locally:

```bash
pnpm docs:dev       # dev server with hot reload
pnpm docs:build     # static build, output in docs/.vitepress/dist
pnpm docs:preview   # serve the built output
```

## Contributing

Contributions are welcome — see **[CONTRIBUTING.md](CONTRIBUTING.md)** for the ground rules (never edit a spec, never copy from `solutions/`, regenerate synced tests) and the pre-PR checklist.

## Changelog

See **[CHANGELOG.md](CHANGELOG.md)** for release history.

## License

[MIT](LICENSE)
