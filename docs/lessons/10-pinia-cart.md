# Lesson 10 — Shared state that survives destructuring

> Prep for Exercise 10. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A composable gives one component its own private copy of some state.
Sometimes that's wrong — several unrelated components genuinely need to read
and change the *same* state, not their own independent copies: a header
badge and a sidebar list both showing how many notes exist, both updating
the instant either one adds a note. Pinia exists for exactly that case: one
store, defined once, that any component in the app can read from and write
to, all seeing the same live values.

## The main idea

A Pinia **setup store** is defined with a function body, the same shape as a
composable, and reads naturally like one:

```ts
// stores/notes.ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<string[]>([])

  const count = computed(() => notes.value.length)

  function add(text: string) {
    notes.value.push(text)
  }

  return { notes, count, add }
})
```

The trap shows up the moment a component reaches into the store the way it
would reach into a plain object:

```vue
<!-- Badge.vue — DOES NOT WORK -->
<script setup lang="ts">
import { useNotesStore } from '../stores/notes'

const { count } = useNotesStore()
</script>

<template>
  <span>{{ count }} notes</span>
</template>
```

This renders `0 notes` once and never updates again, even as notes are
added elsewhere. `useNotesStore()` returns a reactive object, but a plain
JavaScript destructure — `const { count } = useNotesStore()` — reads
`count`'s *value* out at that moment and assigns it to a local variable with
no ongoing connection to the store. It's the same failure as destructuring a
`reactive()` object: the reactivity lives in the object being destructured,
not in whatever value happens to come out of it.

Pinia's `storeToRefs` fixes this by converting each state property and
getter on the store into its own `ref` that stays linked to the store:

```vue
<!-- Badge.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotesStore } from '../stores/notes'

const store = useNotesStore()
const { count } = storeToRefs(store)
</script>

<template>
  <span>{{ count }} notes</span>
</template>
```

`count` here is a real `Ref` connected to the store's own `count`, so it
updates the moment any component calls `store.add(...)`. Actions are
different — `add` is a plain function, not reactive state, so it's taken
directly off the store object rather than through `storeToRefs`:
`const { add } = useNotesStore()` is perfectly safe, because functions don't
lose anything by being destructured.

## You'll also meet

**Getters as derived values.** A setup store's `computed`s (`count` above)
are its getters — cached derivations from the store's own state, the same
`computed` you've already used inside a component, just living in the store
instead.

**One Pinia instance per test.** A store is a singleton *per app instance*,
not a true global — each `createPinia()` call creates an independent
container. Tests call `setActivePinia(createPinia())` (often in
`beforeEach`) specifically so every test gets its own fresh store, with no
notes left over from the previous test. Keeping any of a store's state in
module scope instead of inside `defineStore`'s setup function would defeat
this — it would behave exactly like the module-scope composable bug: one
shared object no `createPinia()` call could ever reset.

**Float rounding.** Money and other computed decimals accumulate floating-
point error — `9.99 * 3` is `29.970000000000002`, not `29.97`. Rounding
belongs in the getter that produces the displayed value, not only in the
template's formatting, so every consumer of that getter sees the same
already-correct number. [Lesson 26](./26-dashboard-stats.md) covers rounding
and defensive parsing in full.

## Reference

→ `docs/PATTERNS.md` § "Pinia setup stores"
→ Earlier lessons: none — Lesson 10 owns Pinia setup stores and `storeToRefs`

## Now do Exercise 10
