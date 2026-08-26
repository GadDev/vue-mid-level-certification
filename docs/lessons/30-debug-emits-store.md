# Lesson 30 — Contracts that look fine until there are two

> Prep for Exercise 30. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

Some bugs only show up once a second instance exists. A component works
perfectly the one time you test it by hand; a store behaves correctly in
the one test that happens to run alone. The bug isn't in the logic anyone
reads line by line — it's in an implicit contract that quietly assumed
there would only ever be one of something: one emitted event name the
parent is actually listening for, or one place state genuinely lives. Two
different families of bug share exactly this shape, and neither one throws
an error to announce itself.

## The main idea

### The `v-model` event-name contract

`v-model` on a component is sugar for a prop plus a *specific* event name —
`update:modelValue` for the default, `update:propName` for a named model.
The child has to emit exactly that name; anything else is a payload sent
into a void the parent was never listening to:

```vue
<!-- SearchBox.vue — DOES NOT WORK with v-model -->
<script setup lang="ts">
const model = defineModel<string>()

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  // looks reasonable — but 'change' is not the event v-model listens for
  emit('change', value)
}

const emit = defineEmits<{ change: [value: string] }>()
</script>

<template>
  <input :value="model" @input="onInput" />
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <SearchBox v-model="query" />
</template>
```

Typing in the input never updates `query`. `v-model="query"` on `SearchBox`
expands to listening for `update:modelValue` specifically — that's the
contract `defineModel` establishes on the child's side too. Emitting
`'change'` instead sends an event nothing is subscribed to; the component
"works" in the sense that it renders and doesn't throw, but the wiring
between parent and child was never actually connected. Nothing here is
wrong within `SearchBox.vue` read in isolation — `emit('change', value)` is
a perfectly valid statement — the mismatch only exists *between* the two
files, in the name each side assumes the other is using.

The fix is for the child to write through `model.value` (which emits the
correct event name automatically, as covered in
[Lesson 06](./06-base-input.md)) rather than emitting a custom event that
`v-model` was never going to listen for:

```vue
<script setup lang="ts">
const model = defineModel<string>()

function onInput(e: Event) {
  model.value = (e.target as HTMLInputElement).value
}
</script>

<template>
  <input :value="model" @input="onInput" />
</template>
```

### Module scope vs. setup-store scope

A Pinia setup store's state has to live *inside* the function passed to
`defineStore`, not beside it, for the same reason
[Lesson 05](./05-counter-history.md) requires a composable's state to live
inside the composable function rather than at module scope:

```ts
// stores/tally.ts — DOES NOT WORK: one shared tally for every pinia instance
import { ref } from 'vue'
import { defineStore } from 'pinia'

const count = ref(0) // created once, when this module is first imported

export const useTallyStore = defineStore('tally', () => {
  function increment() {
    count.value++
  }
  return { count, increment }
})
```

A single mounted app never notices anything wrong — there's only one
`count`, and it behaves exactly like store state should. The bug appears
the moment a **second** Pinia instance exists: `createPinia()` called again
(a second test, a second mounted app) does not create a second `count` —
the module that declares `const count = ref(0)` only runs once, the first
time it's imported, no matter how many times `useTallyStore()` is called
afterward or how many separate Pinia instances invoke it. Every instance of
the store shares the one `count` that was ever created, exactly like a
composable's module-scoped state does.

The fix moves `count` inside the `defineStore` callback:

```ts
// stores/tally.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTallyStore = defineStore('tally', () => {
  const count = ref(0) // created fresh, once per pinia instance

  function increment() {
    count.value++
  }
  return { count, increment }
})
```

Pinia calls this setup function once per store instance it creates, so
`count` declared inside it is created fresh every time — a second
`createPinia()` genuinely gets its own independent `count`, the same
guarantee [Lesson 05](./05-counter-history.md) establishes for composables
in general.

### The shared symptom

Both bugs are invisible with exactly one instance in play — one component,
one mounted app, one test running alone — and both surface identically:
correct behavior with one, silently wrong behavior the moment a second one
exists. Neither produces an error or a type-check failure, because both are
contracts between two pieces of code agreeing on a name or a scope, not
violations either piece of code can see on its own. When something behaves
correctly alone but wrong in combination, the read is not "what does this
component do" — it's "what does this component *assume* about how many of
something else there are, or what name the other side is using."

## Reference

→ `docs/PATTERNS.md` § "Component `v-model` with `defineModel`"
→ `docs/PATTERNS.md` § "Pinia setup stores"
→ Earlier lessons: [Lesson 06](./06-base-input.md) for `defineModel`,
  [Lesson 05](./05-counter-history.md) for composable-scoped state,
  [Lesson 10](./10-pinia-cart.md) for Pinia setup stores

## Sources

- Vue.js official docs — [`defineModel()`](https://vuejs.org/guide/components/v-model.html)
- Vue.js official docs — [Component `v-model` event contract (`update:modelValue`)](https://vuejs.org/guide/components/v-model.html#under-the-hood)
- Vue.js official docs — [`defineEmits()`](https://vuejs.org/api/sfc-script-setup.html#defineemits)
- Pinia official docs — [Setup stores](https://pinia.vuejs.org/core-concepts/index.html#setup-stores)
- Pinia official docs — [Defining a Store](https://pinia.vuejs.org/core-concepts/)
- Michael Thiessen — [Common `v-model` mistakes in Vue 3](https://michaelnthiessen.com) (independent Vue educator on the exact emitted-event-name mismatch this lesson debugs)

## Now do Exercise 30
