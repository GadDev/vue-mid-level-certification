# Lessons

A beginner-paced primer for each exercise, one per page. Read the lesson
before you open the exercise's `README.md` — it teaches the concept and its
API surface on small, neutral examples, and stops deliberately short of the
exercise's own edge cases, its `data-testid` contract, and its solution.

Three documents cover the repo from three different angles, and they are
not interchangeable:

| Document                          | Answers                          | When to read it                          |
| ---------------------------------- | --------------------------------- | ----------------------------------------- |
| A lesson (this directory)          | "I've never used this API — how does it work, and why?" | Before attempting the exercise |
| [`PATTERNS.md`](../PATTERNS.md)    | "I know this idiom, I forgot the exact syntax" | While coding, as a quick lookup |
| [`LEARNING_PATH.md`](../LEARNING_PATH.md) | "What was this exercise actually testing?" | After attempting it, comparing against `solutions/` |

A lesson is prose-heavy and problem-first: it shows a naive attempt failing,
then the idiom that fixes it, on a scenario that has nothing to do with the
exercise's own domain. `PATTERNS.md` is the terse reference for the same
idiom once you already know it. `LEARNING_PATH.md`'s bullets are written
*after* you've tried the exercise, and freely reference the exercise's own
requirements — a lesson never does.

Concepts that recur across exercises are explained in full exactly once, by
the earliest lesson that meets them; every later lesson links back and
describes only what's newly hard in its own context, rather than repeating
the explanation.

## Batch 1 — fundamentals

| # | Lesson | Primary concept | Exercise |
| - | ------ | ---------------- | -------- |
| 01 | [Reaching the real DOM from Vue](./01-scroll-to-item.md) | Template refs, function refs in `v-for`, `nextTick` | [01-scroll-to-item](../../packages/01-scroll-to-item/) |
| 02 | [State that describes the UI vs. state that describes the data](./02-shopping-list.md) | View state vs. domain state | [02-shopping-list](../../packages/02-shopping-list/) |
| 03 | [`computed`, and why not a method](./03-search-users.md) | `computed` as cached derivation | [03-search-users](../../packages/03-search-users/) |
| 04 | [Sorting without breaking your source](./04-sort-products.md) | Immutability & comparators | [04-sort-products](../../packages/04-sort-products/) |
| 05 | [Your first `useX()` composable](./05-counter-history.md) | Composable factories | [05-counter-history](../../packages/05-counter-history/) |

## Batch 2 — composition & ecosystem

| # | Lesson | Primary concept | Exercise |
| - | ------ | ---------------- | -------- |
| 06 | [Building a component the parent still owns](./06-base-input.md) | `defineModel`, typed props & emits, `useId` | [06-base-input](../../packages/06-base-input/) |
| 07 | [Letting the caller decide what renders](./07-data-table-slots.md) | Named & scoped slots, generic components | [07-data-table-slots](../../packages/07-data-table-slots/) |
| 08 | [Passing data down without props](./08-theme-provider.md) | `provide`/`inject`, app-level state via a plugin | [08-theme-provider](../../packages/08-theme-provider/) |
| 09 | [Why `/users/2` doesn't re-run your `setup()`](./09-router-master-detail.md) | Route params with component reuse, guards & meta | [09-router-master-detail](../../packages/09-router-master-detail/) |
| 10 | [Shared state that survives destructuring](./10-pinia-cart.md) | Pinia setup stores, `storeToRefs` | [10-pinia-cart](../../packages/10-pinia-cart/) |
| 11 | [Async work that keeps changing its mind](./11-async-search.md) | `watch` cleanup, debounce, stale-response races | [11-async-search](../../packages/11-async-search/) |
| 12 | [Composables that clean up after themselves](./12-composable-storage.md) | `effectScope`/`onScopeDispose`, deep `watch`, SSR guards | [12-composable-storage](../../packages/12-composable-storage/) |

## Batch 3 — component patterns

| # | Lesson | Primary concept | Exercise |
| - | ------ | ---------------- | -------- |
| 13 | [One open at a time, by construction](./13-accordion.md) | Making an invariant unrepresentable; the ARIA contract | [13-accordion](../../packages/13-accordion/) |
| 14 | [When the list changes under the selection](./14-tabs.md) | Derived-not-stored selection | [14-tabs](../../packages/14-tabs/) |
| 15 | [Rendering a form you didn't write](./15-dynamic-form.md) | Schema-driven rendering & control dispatch | [15-dynamic-form](../../packages/15-dynamic-form/) |
| 16 | [Two pieces of state that look like one](./16-rating.md) | Preview vs. committed state | [16-rating](../../packages/16-rating/) |
| 17 | [Fallback content, and listeners that die with the component](./17-modal.md) | Listener lifecycle | [17-modal](../../packages/17-modal/) |

## Batch 4 — stateful UI & composables

| # | Lesson | Primary concept | Exercise |
| - | ------ | ---------------- | -------- |
| 18 | [One timer per item, all of them yours](./18-notification-queue.md) | Timer ownership | [18-notification-queue](../../packages/18-notification-queue/) |
| 19 | [Clamping is a derivation, not an assignment](./19-pagination.md) | Generic composables, clamp-on-read | [19-pagination](../../packages/19-pagination/) |
| 20 | [The second call that shouldn't happen](./20-infinite-scroll.md) | In-flight guard, terminal states | [20-infinite-scroll](../../packages/20-infinite-scroll/) |
| 21 | [Owning `setInterval`](./21-use-countdown.md) | Double-start guard, interval dies with the scope | [21-use-countdown](../../packages/21-use-countdown/) |
| 22 | [The request state machine](./22-use-fetch.md) | Per-instance cache, the request ticket | [22-use-fetch](../../packages/22-use-fetch/) |
| 23 | [APIs that might not be there](./23-clipboard.md) | Feature detection, injected side effects | [23-clipboard](../../packages/23-clipboard/) |

## Batch 5 — ecosystem at scale

| # | Lesson | Primary concept | Exercise |
| - | ------ | ---------------- | -------- |
| 24 | [Getters that take an argument](./24-pinia-wishlist.md) | A getter returning a function | [24-pinia-wishlist](../../packages/24-pinia-wishlist/) |
| 25 | [The store knows who; the router decides where](./25-pinia-auth-guard.md) | Global `beforeEach`, the redirect round-trip | [25-pinia-auth-guard](../../packages/25-pinia-auth-guard/) |
| 26 | [Trusting nothing on the way in](./26-dashboard-stats.md) | Defensive parsing with a type predicate, rounding | [26-dashboard-stats](../../packages/26-dashboard-stats/) |
| 27 | [The URL is the state](./27-query-filters.md) | `route.query` normalisation | [27-query-filters](../../packages/27-query-filters/) |
| 28 | [Never hand-write a breadcrumb trail](./28-breadcrumbs.md) | `route.matched` & `meta` as a UI source | [28-breadcrumbs](../../packages/28-breadcrumbs/) |

## Batch 6 — debugging

| # | Lesson | Primary concept | Exercise |
| - | ------ | ---------------- | -------- |
| 29 | [Why reactive code stops working](./29-debug-reactivity.md) | Tracing lost reactivity | [29-debug-reactivity](../../packages/29-debug-reactivity/) |
| 30 | [Contracts that look fine until there are two](./30-debug-emits-store.md) | The `v-model` contract; module vs. setup-store scope | [30-debug-emits-store](../../packages/30-debug-emits-store/) |
