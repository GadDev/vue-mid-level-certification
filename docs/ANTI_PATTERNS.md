# Anti-Patterns: the near-miss version of each idiom

[PATTERNS.md](PATTERNS.md) documents the idiom you want. This file documents the one a learner
actually writes — the *near miss*: code that produces the correct output once and fails on the
second interaction.

That "second interaction" is the whole point. **The majority of the eighteen traps below are
invisible to a test that only asserts the initial render** — they need a second instance, a
second navigation, a second request, a populated slot, a prop replacement, or a repeated call to
fail. An exercise whose suite goes green on the wrong idiom teaches the wrong idiom.

Two audiences:

- **Authoring an exercise** (`/new-exercise`) — every concept the exercise teaches should have
  its trap closed by an assertion. Write that assertion deliberately.
- **Reviewing one** (`/review-exercise`) — for each trap in scope, quote the assertion that
  fails it, or record that none does.

Each entry carries a **Find it** grep so the "Applies to" list can be re-derived instead of
trusted. The lists were verified against `solutions/` on 2026-08-17; re-run the greps rather
than believing them.

---

## AP-1 · Module-level state in a composable

```ts
const count = ref(0)                                    // ❌ outside the function
export function useCounter() { return { count } }
```

The `ref` is created once per *module*, so every caller shares one instance. One counter on the
page behaves perfectly; two are secretly the same counter, and tests leak state into each other.

**Right:** declare all state inside the function body. A composable is a factory.

**Closing assertion:** call it twice, mutate one instance, assert the other is untouched.
A single-instance test can never see this bug.

**Applies to:** 05, 11, 12, 18, 19, 20, 21, 22, 23, 28
**Find it:** `grep -rn "^const .*= ref(" solutions/*/src/composables/`

---

## AP-2 · Mutating a shared source inside a `computed`

```ts
const sorted = computed(() => products.value.sort(byPrice))       // ❌
const sorted = computed(() => [...products.value].sort(byPrice))  // ✅
```

`sort` and `reverse` mutate in place. When the array is a module-scoped source of truth
(`src/data/*.ts` is exactly that), this permanently reorders it for every other consumer — from
inside a getter, which must be pure. The first render looks right; the unsorted view elsewhere
is now sorted, and toggling direction gives order-dependent results.

**The contrast case is 02**, which mutates a list it owns from an event handler. That is fine.
The rule is not "never mutate" — it is *who owns the array, and are you inside a getter*.

**Closing assertion:** import the source array, read the computed, assert the source's order is
unchanged.

**Applies to:** 04, 27 (29 ships this as a deliberate bug)
**Find it:** `grep -rn "\.sort(\|\.reverse(" solutions/*/src`

---

## AP-3 · Destructuring a store

```ts
const { itemCount, subtotal } = useCartStore()   // ❌ two plain numbers
```

Destructuring reads `.value` off the getters once and hands you the numbers. The template shows
the correct total, then never updates again.

**Right:** `storeToRefs(cart)` for state and getters. Actions destructure fine — functions do
not need reactivity.

**Closing assertion:** add an item, then re-assert the total. Asserting it once proves nothing.

**Applies to:** 10, 24, 26 (30 ships this as a deliberate bug)
**Find it:** `grep -rn "storeToRefs\|= use.*Store()" solutions/*/src`

---

## AP-4 · A stale async response with no request ticket

```ts
controller.abort()   // ❌ assumed sufficient on its own
```

`AbortController` only helps if the transport cooperates. A mocked API — and a real request that
has already resolved — still settles, so response 1 overwrites response 2, and a stale `finally`
clears `loading` for the request that is still in flight.

**Right:** `const current = ++ticket` before the request, and `if (current !== ticket) return` on
*every* exit path including `finally`. Abort and ticket are complementary, not alternatives:
11 uses both, 22 uses a ticket alone.

**Closing assertion:** resolve request 1 *after* request 2 and assert the displayed result is 2's.

**Applies to:** 11 (abort + ticket), 22 (ticket)
**Find it:** `grep -rn "ticket\|requestId\|AbortController" solutions/*/src`

---

## AP-5 · `onUnmounted` where the spec stops an `effectScope`

```ts
onUnmounted(() => window.removeEventListener('resize', update))   // ❌
onScopeDispose(() => window.removeEventListener('resize', update)) // ✅
```

`onUnmounted` requires a component instance. A composable exercised through
`effectScope().run()` never mounts, so the hook silently fails to register and the listener
leaks. `onScopeDispose` fires on scope stop *and* on unmount — strictly broader.

**Closing assertion:** `scope.stop()`, then dispatch the event and assert nothing reacted.

**Applies to:** 12, 18, 21, 23
**Find it:** `grep -rn "onUnmounted\|onScopeDispose" solutions/*/src`

---

## AP-6 · `v-show` where the spec asserts absence

`v-show` toggles `display: none` and leaves the node in the DOM, so
`wrapper.find('[data-testid="empty"]').exists()` stays `true` forever. In a browser the two are
visually identical — which is exactly why learners reach for it.

**Right:** `v-if` for any state that must be *absent*. `v-show` is for cheap frequent toggling of
something that stays mounted.

**Closing assertion:** already written wherever a spec asserts `exists()` is `false` — this trap
is closed by default. Worth listing in the README's edge cases anyway, because the failure reads
like a test bug rather than a code bug.

**Applies to:** any exercise with an empty/hidden state — 20 of them at last count
**Find it:** `grep -rln "exists()).toBe(false)" solutions/*/tests`

---

## AP-7 · Mutating a prop instead of `defineModel`

```ts
props.modelValue = event.target.value   // ❌ the parent owns it
```

Vue warns at runtime and the parent's value never changes, so the input appears to work right up
until the parent re-renders and clobbers it.

**Right:** `defineModel<string>({ required: true })` — a writable ref that emits
`update:modelValue` correctly.

**Closing assertion:** assert the *parent's* value changed, not the input's.

**Applies to:** 06, 16 (30 ships this as a deliberate bug)
**Find it:** `grep -rn "defineModel\|modelValue" solutions/*/src`

---

## AP-8 · A scoped slot that still renders its fallback

```vue
<slot name="row" :item="item" />
<td data-testid="fallback-cell">{{ item.id }}</td>   <!-- ❌ outside the slot -->
```

Fallback content must sit *between* the slot tags. Placed outside, it renders alongside consumer
content: an empty table looks perfect, a populated one shows both.

**Closing assertion:** mount *with* the slot filled and assert the fallback `data-testid` is gone.
Testing the fallback alone proves only half the contract.

**Applies to:** 07, 17
**Find it:** `grep -rn "<slot" solutions/*/src`

---

## AP-9 · A route param read once, outside a `computed`

```ts
const id = Number(useRoute().params.id)                  // ❌ frozen at first value
const id = computed(() => Number(route.params.id))       // ✅
```

`/users/1` → `/users/2` matches the same route record, so Vue Router **reuses the component
instance and `setup()` never runs again**. The first user renders correctly and the page then
never changes. Same trap for `route.query` (27). Params can also be `string | string[]` —
normalise before parsing.

**Right:** derive with `computed`, or re-fetch with
`watch(() => route.params.id, load, { immediate: true })`.

**Closing assertion:** navigate twice within one test.

**Applies to:** 09, 28 (params), 27 (query)
**Find it:** `grep -rn "route.params\|route.query" solutions/*/src`

---

## AP-10 · A boolean flag per item instead of one active id

```ts
sections.forEach(s => { s.open = false })   // ❌ "only one open" is a rule you must enforce
section.open = true
```

```ts
const openId = ref<string | null>(null)     // ✅ "only one open" is true by construction
```

With a flag per item, "close every other one" is an extra step a handler can forget — two
sections open at once is one missed line away. Storing a single id makes the invariant
unreachable: there is only one value, so only one thing can match it.

**Closing assertion:** open item A, then item B, assert **A** is now closed — not just that B is
open.

**Applies to:** 13
**Find it:** `grep -n "openId" solutions/13-accordion/src/components/Accordion.vue`

---

## AP-11 · A selection that doesn't survive a prop replacement

```ts
const selectedId = ref(props.tabs[0]?.id ?? null)   // ❌ set once, at setup
```

Set once, `selectedId` is correct on mount and stale forever after: a refetch that produces new
objects with the same ids, a re-order, or the selected tab disappearing all leave the UI showing
whatever `setup()` first saw. This is the same shape as [AP-9](#ap-9--a-route-param-read-once-outside-a-computed) one level up — a value read once
from something that can change out from under the component — but the "something" here is a
prop, not the route.

**Right:** `watch(() => props.tabs, list => { if (!list.some(t => t.id === selectedId.value))
selectedId.value = list[0]?.id ?? null })`, re-validating the id against the new list rather than
trusting it still applies.

**Closing assertion:** replace the prop with structurally-identical-but-new objects (a re-fetch),
and separately with the selected item removed; assert the selection survives the first and falls
back sanely on the second.

**Applies to:** 14
**Find it:** `grep -n "watch(" solutions/14-tabs/src/components/Tabs.vue`

---

## AP-12 · Hover preview written straight into the committed value

```ts
function onHover(value: number): void {
  model.value = value   // ❌ every hover is now a commit
}
```

A rating widget (or anything with a "preview before you commit" interaction) needs **two**
numbers: what's shown, and what's true. Writing the hover value into the actual `v-model`
commits on every mouse movement — leaving the component with the last star the pointer happened
to cross, not the one that was clicked.

**Right:** a separate `hovered` ref, `null` when not hovering (`0` is a real value and can't
double as "nothing"), and a `displayed = computed(() => hovered.value ?? model.value)` that the
template renders instead of `model` directly.

**Closing assertion:** hover a star, assert nothing was emitted yet; move the pointer away, assert
the display reverts to the last committed value.

**Applies to:** 16
**Find it:** `grep -n "hovered\|displayed" solutions/16-rating/src/components/Rating.vue`

---

## AP-13 · One shared timer for a per-item lifecycle

```ts
let timer: ReturnType<typeof setTimeout>          // ❌ one clock for every toast
function notify(message: string) {
  toasts.value.push({ id, message })
  clearTimeout(timer)
  timer = setTimeout(() => toasts.value.shift(), duration)   // dismisses whichever is oldest
}
```

A single shared timer means adding toast 2 resets toast 1's countdown, and dismissing toast 1
early cancels toast 2's clock along with it. Each item with its own lifetime needs its own
handle.

**Right:** `const timers = new Map<number, ReturnType<typeof setTimeout>>()`, one entry per id,
cleared individually in `dismiss(id)` and drained entirely in `clear()`/`onScopeDispose`.

**Closing assertion:** queue two toasts 1s apart, dismiss the first by hand, advance past the
second's original deadline, and assert the second is *also* gone — a shared timer either drops
it too early or leaks it forever depending on which direction the bug goes.

**Applies to:** 18
**Find it:** `grep -n "Map<number" solutions/18-notification-queue/src/composables/useToasts.ts`

---

## AP-14 · Guarding re-entry on a flag instead of the resource itself

```ts
let running = false                    // ❌ can disagree with whether a timer actually exists
function start() {
  if (running) return
  running = true
  timer = setInterval(tick, 1000)
}
```

A boolean can drift out of sync with the thing it's supposed to describe — `running` can be
`true` after the interval already cleared itself (or `false` while one is still ticking), and
either way the guard now lies. The same shape shows up as a **missing** guard entirely: an
infinite-scroll handler with no check at all fires a second request on every scroll-tick while
the first is still in flight.

**Right:** guard on the resource handle itself (`if (timer !== null) return`), or on the request
promise's own in-flight state (`if (loading.value || done.value) return`) — never on a separately
maintained flag that has to be kept in sync by hand.

**Closing assertion:** call `start()`/`loadMore()` twice back to back and assert only one
timer/request exists — `vi.getTimerCount()`, or the mock's call count.

**Applies to:** 20, 21, 23
**Find it:** `grep -n "timer !== null\|loading.value || done.value" solutions/{20-infinite-scroll,21-use-countdown,23-clipboard}/src/composables/*.ts`

---

## AP-15 · Resolving a singleton outside the scope that needs the active one

```ts
const auth = useAuthStore()          // ❌ at module scope, in the router file
router.beforeEach(to => { … uses `auth` … })
```

`useAuthStore()` at import time — before `app.use(pinia)` has run, or captured once and reused
across every test — grabs whatever pinia instance (or none) happens to be active *then*, not the
one active when the guard actually runs. Each test creates a fresh `createPinia()`; a guard that
captured the store once keeps talking to the first test's instance forever.

**Right:** call `useAuthStore()` **inside** the guard function, so it resolves against whichever
pinia is active at navigation time.

**Closing assertion:** run two tests in sequence, each with its own `setActivePinia(createPinia())`
and its own sign-in state, and assert the guard's behaviour differs between them — a captured
store passes the first test and silently reuses its state in the second.

**Applies to:** 25
**Find it:** `grep -n "useAuthStore()" solutions/25-pinia-auth-guard/src/router/index.ts` — the
call must be inside `router.beforeEach(...)`, not above it.

---

## AP-16 · A derived number rounded per-consumer instead of once in the getter

```ts
{{ average.toFixed(2) }}                              // ❌ only this template rounds
{{ (total / count).toFixed(2) }}                       // ❌ recomputed differently elsewhere
```

`9.99 * 3` is `29.970000000000002`. Rounding it in the template papers over the display for that
one consumer, but the raw, unrounded value is still what's stored and compared — a second view of
the same figure (a test assertion, an export, another component) can disagree with the first by a
fraction of a cent.

**Right:** round once, in the getter that produces the value —
`computed(() => Math.round((total / count) * 100) / 100)` — so every consumer, including the
test, reads the same already-correct number.

**Closing assertion:** assert the getter's raw value directly (not through `.toFixed()` in the
test), with inputs chosen to expose floating-point drift if rounding happened downstream instead.

**Applies to:** 10, 26
**Find it:** `grep -n "Math.round" solutions/{10-pinia-cart,26-dashboard-stats}/src/{stores,composables}/*.ts`

---

## AP-17 · A browser feature assumed present instead of detected

```ts
navigator.clipboard.writeText(text)              // ❌ throws if `clipboard` is undefined
window.localStorage.getItem(key)                 // ❌ same, and also throws in some privacy modes
```

`navigator.clipboard`, `window.localStorage`, and similar browser APIs are missing under SSR, on
insecure origins, in older browsers, and sometimes throw outright when *accessed* (not just when
called) in a locked-down privacy mode. Code that assumes the API exists works everywhere the
author tested it and crashes the first time it doesn't.

**Right:** feature-detect before use, and design the fallback in from the start rather than
bolting a `try`/`catch` on afterwards: `typeof navigator === 'undefined' ||
!navigator.clipboard?.writeText` gates whether the feature is offered at all
(`isSupported`), not just whether a call might throw.

**Closing assertion:** stub the global to simulate its absence (`vi.stubGlobal('navigator', {})`)
and assert the composable degrades — `isSupported` false, a clear error, no thrown exception —
rather than crashing the test.

**Applies to:** 12, 23
**Find it:** `grep -n "typeof window\|typeof navigator" solutions/{12-composable-storage,23-clipboard}/src/composables/*.ts`

---

## AP-18 · A filter change that leaves stale dependent state behind

```ts
function onSearchInput(value: string) {
  query.value = value   // ❌ page is still 7, but there are now only 2 pages of results
}
```

Changing what's filtered (a search term, a sort, a page size) changes how many pages of results
exist — a page number that made sense against the old set can point past the end of the new one,
or just land on the wrong slice silently if nothing clamps it. The bug is invisible until someone
is deep in the list when they change the filter.

**Right:** any handler that changes the filter criteria also resets pagination to page 1
explicitly; a handler that only changes the page leaves the other filters untouched.

**Closing assertion:** navigate to a page beyond page 1, then change the search term or the page
size, and assert the view is back on page 1 — not merely that the new results are correct.

**Applies to:** 19 (page-size reset), 27 (search/sort reset)
**Find it:** `grep -n "page.value = 1\|page: 1" solutions/{19-pagination,27-query-filters}/src/{composables,views}/*`

---

## Three traps, one root cause

AP-1, AP-2 and AP-3 are the same mistake wearing different clothes: **a reactive reference
captured at the wrong moment or in the wrong scope.** Module scope captures too early,
`sort()` captures the shared identity, destructuring captures the value. That is arguably the
hardest single idea in Vue 3, and it lands better taught as one idea than as three rules.

AP-5 and AP-6 are the testing-shaped pair: they fail in the harness for reasons that never
surface in a browser. Say so in the exercise README, or a stuck learner will read the failure as
a broken test rather than broken code.

## Adding a trap

An entry earns its place when it is a *near miss* — the wrong version has to be plausible enough
that a competent learner writes it and ships it. "Forgot `.value`" is not a trap; it fails
immediately and loudly. Give every new entry an `AP-N` id, a closing assertion, and a **Find it**
grep, then check whether the exercises it applies to actually close it.
