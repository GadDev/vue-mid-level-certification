# Lesson 26 — Trusting nothing on the way in

> Prep for Exercise 26. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

Data from an API arrives typed as whatever the API actually sent, not
whatever your `interface` promises it should be — a network response is, at
best, `unknown` until something actually checks it. Casting it straight to
your expected shape (`data as Metric[]`) doesn't validate anything; it just
tells TypeScript to stop checking, which means a malformed entry — a
missing field, a string where a number belongs, a `NaN` — sails straight
through and corrupts every calculation downstream, usually silently.

![Lesson 26 — Trusting nothing on the way in](../assets/lesson_26.png)

## The main idea

Casting the incoming payload is the path of least resistance:

```ts
interface Metric {
  id: number
  label: string
  value: number
}

function setData(raw: unknown[]) {
  const metrics = raw as Metric[] // asserts, does not check
  const average = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
}
```

If one entry in `raw` is `{ id: 1, label: 'cpu', value: 'n/a' }` — a string
where a number belongs — `as Metric[]` doesn't object. TypeScript trusts the
assertion and moves on. The arithmetic then does `sum + 'n/a'`, which
JavaScript happily evaluates as string concatenation instead of throwing,
and `average` ends up `NaN` or a garbled string, discovered only once it's
already rendered somewhere.

The fix is to actually check each entry's shape at runtime, using a
function whose return type tells TypeScript what was verified — a **type
predicate**:

```ts
interface Metric {
  id: number
  label: string
  value: number
}

function isMetric(entry: unknown): entry is Metric {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    typeof (entry as Metric).id === 'number' &&
    typeof (entry as Metric).label === 'string' &&
    typeof (entry as Metric).value === 'number' &&
    Number.isFinite((entry as Metric).value)
  )
}

function setData(raw: unknown[]) {
  const metrics = raw.filter(isMetric) // metrics is Metric[], not unknown[]
  const average = metrics.length
    ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
    : 0
}
```

`entry is Metric` is the part that matters: it tells TypeScript that
wherever `isMetric` returns `true`, the value really is checked to be a
`Metric` — so `raw.filter(isMetric)` doesn't just filter at runtime, it also
narrows the *type* of the resulting array to `Metric[]`, with no separate
cast needed afterward. `Number.isFinite` specifically (rather than merely
`typeof value === 'number'`) is what rejects `NaN` and `Infinity` — both
pass `typeof x === 'number'` in JavaScript, since they genuinely are values
of type `number`, just not ones that make sense for an average.

### Rounding belongs in the getter

A derived average is exactly the kind of value [Lesson 03](./03-search-users.md)
covers with `computed` — but the rounding has to happen at the point the
value is *produced*, not wherever it happens to be displayed:

```ts
import { computed } from 'vue'

const average = computed(() => {
  if (!metrics.value.length) return 0
  const total = metrics.value.reduce((sum, m) => sum + m.value, 0)
  return Math.round((total / metrics.value.length) * 100) / 100 // 2 decimals
})
```

Rounding inside the `computed` itself means every consumer of `average`
sees the same already-correct number, rather than each place that displays
it separately calling `.toFixed(2)` on a raw, unrounded float and hoping
every call site remembers to. It's the same principle
[Lesson 10](./10-pinia-cart.md) and [Lesson 24](./24-pinia-wishlist.md)
touch on briefly for money — a derived numeric value that's ever displayed
should be correct where it's derived, not patched up wherever it's rendered.

## Reference

→ `docs/PATTERNS.md` § "Computed Properties for Filtering & Sorting"
→ Earlier lessons: [Lesson 03](./03-search-users.md) for `computed` as
  derivation, [Lesson 10](./10-pinia-cart.md) and
  [Lesson 24](./24-pinia-wishlist.md) for where rounding was first mentioned

## Sources

- TypeScript official docs — [Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- TypeScript official docs — [Type Assertions vs. type narrowing](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)
- MDN — [`Number.isFinite()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite)
- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- Matt Pocock (Total TypeScript) — [Type predicates and narrowing `unknown`](https://www.totaltypescript.com/) (independent TypeScript expert covering runtime-validated narrowing, the technique this lesson applies to API payloads)
- Zod docs — [Schema validation for untrusted data](https://zod.dev/) (a widely used library alternative to hand-written type predicates for the same "validate before trusting" problem)

## Now do Exercise 26

<a href="https://github.com/GadDev/vue-mid-level-certification/tree/main/packages/26-dashboard-stats" target="_blank">Open exercise on GitHub</a>
