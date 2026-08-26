# Lesson 13 — One open at a time, by construction

> Prep for Exercise 13. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

"Only one panel open at a time" sounds like a rule you enforce with careful
code — close the others whenever one opens. But a rule enforced by
discipline can always be violated by a code path that forgets to apply it.
[Lesson 02](./02-shopping-list.md) drew the line between domain data and
view state; this is the same distinction with a sharper consequence — some
shapes of view state make an invalid combination *impossible to represent*,
so there's no discipline required to prevent it, because there's no variable
that could ever hold two "open" values at once.

## The main idea

The tempting shape is a boolean per section, mirroring "each section has an
open/closed state" directly:

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Section {
  id: string
  title: string
  open: boolean
}

const sections = ref<Section[]>([
  { id: 'shipping', title: 'Shipping', open: false },
  { id: 'returns', title: 'Returns', open: false },
])

function toggle(section: Section) {
  section.open = !section.open
}
</script>
```

This compiles, runs, and looks reasonable — until `toggle` is called on a
second section while the first is still open. Nothing here closes the first
one; each section's `open` is independent, so two (or all) of them can be
`true` simultaneously. Fixing it means remembering, at every call site that
sets `open`, to also close every *other* section's `open` — a rule that has
to be manually upheld everywhere state changes, and silently breaks the
moment a new call site forgets it.

The fix removes the possibility instead of guarding against it: store a
single "which one is open" value, not a flag per section.

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Section {
  id: string
  title: string
}

const sections = ref<Section[]>([
  { id: 'shipping', title: 'Shipping' },
  { id: 'returns', title: 'Returns' },
])

const openId = ref<string | null>(null)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <div v-for="section in sections" :key="section.id">
    <button @click="toggle(section.id)">{{ section.title }}</button>
    <div v-if="openId === section.id">Panel content for {{ section.title }}</div>
  </div>
</template>
```

There is exactly one `openId`, and it can hold exactly one value — a single
id, or `null`. "Two sections open at once" isn't a bug this version avoids
through careful handling; it's a state that literally cannot be constructed,
because there is no second variable to disagree with the first. Clicking the
already-open section's header sets `openId` back to `null` via the ternary,
closing it with no special case needed — it's the same assignment as opening
any other section, just landing on the value that happens to mean "none."

## You'll also meet

### The ARIA contract

A collapsible section like this is a **disclosure widget**, and screen
readers need more than visual hiding to understand it. Two things make it
accessible:

```vue
<template>
  <button :aria-expanded="openId === section.id" :aria-controls="`panel-${section.id}`">
    {{ section.title }}
  </button>
  <div v-if="openId === section.id" :id="`panel-${section.id}`">
    Panel content for {{ section.title }}
  </div>
</template>
```

- **`aria-expanded`** on the toggle button tells assistive tech whether the
  section it controls is currently open — a boolean attribute, not merely a
  visual state the DOM has no other way to announce.
- **`aria-controls`** points at the id of the element the button reveals,
  giving the two elements an explicit relationship instead of relying on
  visual proximity.

Using `v-if` rather than `v-show` for the panel isn't just a rendering
choice here — it means a closed panel's content is genuinely absent from the
accessibility tree, not merely hidden with CSS while still technically
present and potentially reachable. When a widget's contract requires that
"closed" means "not there," `v-if` is what actually delivers that, where
`v-show`'s `display: none` alone would not.

## Reference

→ `docs/PATTERNS.md` § "Conditional Rendering with `v-if`, `v-show`, `v-else`"
→ Earlier lessons: [Lesson 02](./02-shopping-list.md) for view state vs.
  domain state

## Sources

- Vue.js official docs — [Conditional Rendering: `v-if` vs. `v-show`](https://vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show)
- Vue.js official docs — [List Rendering: `v-for` and `:key`](https://vuejs.org/guide/essentials/list.html)
- MDN / W3C WAI-ARIA — [ARIA: `disclosure` pattern](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Disclosure)
- W3C WAI-ARIA Authoring Practices — [`aria-expanded`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded) and [`aria-controls`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-controls)
- Michael Thiessen — [Why You Shouldn't Use v-show](https://michaelnthiessen.com/why-not-vshow) (independent Vue educator on when `v-if`'s full unmount is the correct choice over `v-show`)

## Now do Exercise 13
