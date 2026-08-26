# Lesson 29 — Why reactive code stops working

> Prep for Exercise 29. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

The most disorienting Vue bug is not a crash — it's silence. The app runs,
nothing throws, and some piece of the screen simply never updates again after
the first render. `console.log` inside the handler that's supposed to cause
the update proves the handler *ran*; the value it touched is provably new;
and the template still shows the old one.

That silence has one shared cause: something in the chain between "a value
changed" and "the template re-rendered" is not actually reactive, even though
it looks like it should be. Fixing it is not about reading the business logic
more carefully — the logic is usually fine. It's about tracing which values
in a computed or a watch are the ones Vue is actually watching, and which
ones only look like they are.

## The main idea

Three unrelated pieces of code produce the exact same symptom — renders once,
then goes stale — for three different reasons. None of them errors. None of
them warns. All three type-check cleanly.

### 1. Destructuring a `reactive()` object

```vue
<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({ count: 0 })
// looks harmless — 'count' is just a number, right?
const { count } = state

function increment() {
  state.count++
}
</script>

<template>
  <!-- never updates: this is the plain number captured at destructure time -->
  <p>{{ count }}</p>
  <button @click="increment">+</button>
</template>
```

`reactive()` returns a proxy — reactivity lives in the proxy's get/set traps,
not in the plain value sitting behind a property. Destructuring reads the
property once and copies out a plain, disconnected `number`. `state.count`
keeps updating; the local `count` variable never hears about it, because it
was never anything more than a snapshot.

The fix is to keep the reference to the reactive source, either by reading
`state.count` directly in the template or by converting the property to its
own tracked reference with `toRef(state, 'count')` before destructuring it.

### 2. A `computed` that does work belonging in a `watch`

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const price = ref(10)
const quantity = ref(1)
let total = 0

// looks like a derived value — it isn't one, it's a side effect in disguise
const recompute = computed(() => {
  total = price.value * quantity.value
})
</script>

<template>
  <!-- 'total' is a plain variable; the template has no reactive link to it -->
  <p>{{ total }}</p>
</template>
```

A `computed` exists to *return* a derived value that Vue tracks — the
template subscribes to the `ComputedRef` itself, not to whatever the callback
happened to assign somewhere else. Here the callback assigns to an outer
`let` and returns nothing; nothing in the template ever reads
`recompute.value`, so nothing establishes the dependency in the first place,
and even the assignment only reruns when something reads `recompute.value`
to begin with — which nothing does. The value the template *does* read,
`total`, is a plain number with no reactive identity at all.

The fix is to make the computed return the value directly —
`const total = computed(() => price.value * quantity.value)` — and read
`total.value` wherever it's needed.

### 3. A `watch` that never fires on a nested change

```vue
<script setup lang="ts">
import { reactive, watch } from 'vue'

const filters = reactive({ category: 'all', inStock: false })

// fires when 'filters' itself is replaced — never when a property inside it changes
watch(filters, () => {
  console.log('filters changed')
})

function toggleStock() {
  filters.inStock = !filters.inStock
}
</script>
```

`watch()` on a reactive object only does a **shallow** comparison by default:
it notices when the object is replaced wholesale, not when a property one
level inside it is mutated. `filters.inStock = !filters.inStock` mutates the
existing object in place — same reference, so as far as the shallow watcher
is concerned, nothing changed.

The fix is `{ deep: true }` — `watch(filters, callback, { deep: true })` — or,
often clearer, watching the one property that actually matters:
`watch(() => filters.inStock, callback)`.

### The shared method

All three bugs are invisible from the business logic alone; `increment()`,
the price/quantity math, and `toggleStock()` are each individually correct.
What's broken is always one of: what a value is connected to, what a
`computed` returns versus what it merely does, or how deep a `watch`
actually looks. When reactive code stops updating, stop reading the logic
top to bottom and instead trace backward from the template expression that
won't update: what reactive source is it reading, and is that source really
still connected to the thing being changed?

## Reference

→ `docs/PATTERNS.md` § "Reactive Objects with `reactive()`"
→ `docs/PATTERNS.md` § "Computed Properties for Filtering & Sorting"
→ `docs/PATTERNS.md` § "Watchers for Side Effects"
→ Earlier lessons: none — this lesson owns tracing reactivity loss

## Sources

- Vue.js official docs — [Reactivity Fundamentals: `reactive()` and losing reactivity on destructure](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive-proxy-vs-original)
- Vue.js official docs — [`toRef()`](https://vuejs.org/api/reactivity-utilities.html#toref)
- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- Vue.js official docs — [Watchers: deep watchers](https://vuejs.org/guide/essentials/watchers.html#deep-watchers)
- Vue.js official docs — [Reactivity in Depth: how reactivity tracking actually works](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- Anthony Fu — [Vue Reactivity: how it really works under the hood](https://antfu.me) (Vue core team member's deep dive into proxy-based tracking, useful for understanding all three bugs in this lesson from first principles)

## Now do Exercise 29
