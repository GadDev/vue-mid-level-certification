# Anti-Patterns: the near-miss version of each idiom

[PATTERNS.md](PATTERNS.md) documents the idiom you want. This file documents the one a learner
actually writes — the *near miss*: code that produces the correct output once and fails on the
second interaction.

That "second interaction" is the whole point. **Six of the nine traps below are invisible to a
test that only asserts the initial render** — they need a second instance, a second navigation,
a second request, or a populated slot to fail. An exercise whose suite goes green on the wrong
idiom teaches the wrong idiom.

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
