# Lesson 07 — Letting the caller decide what renders

> Prep for Exercise 07. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A reusable list component knows *how* to loop — iterate the items, handle
the empty case, key each row. It cannot know *what* each row should look
like, because that depends entirely on what's being listed: a component
rendering products needs different markup than one rendering comments. Props
alone can't solve this — you'd need a prop for every possible cell layout a
consumer might want. What the reusable component needs is a way to own the
loop while handing the *content* of each iteration back to whoever is using
it.

## The main idea

A **slot** is a hole in a component's template that the parent fills. The
simplest kind is a named, content-only slot — no data passed through it,
just a place for arbitrary markup:

```vue
<!-- ListPanel.vue -->
<template>
  <section>
    <header>
      <slot name="title">Untitled list</slot>
    </header>
    <p v-if="!items.length"><slot name="empty">Nothing here.</slot></p>
  </section>
</template>

<script setup lang="ts">
defineProps<{ items: unknown[] }>()
</script>
```

```vue
<!-- Parent.vue -->
<template>
  <ListPanel :items="tasks">
    <template #title>Today's tasks</template>
  </ListPanel>
</template>
```

The parent filled `title` and left `empty` alone, so `empty` falls back to
its default content, `Nothing here.` — a slot's own children are the
fallback shown whenever the consumer doesn't provide that slot at all. That
covers layout the reusable component can't predict, but it doesn't yet solve
the loop: for a list of rows, each row's *content* depends on data the
component owns (`item`, its index) that the plain named slot has no way to
hand over.

That's what a **scoped slot** is for — a slot that passes data back out to
whatever the consumer puts inside it:

```vue
<!-- ListPanel.vue -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="index">
      <slot name="row" :item="item" :index="index">
        {{ item }}
      </slot>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ items: unknown[] }>()
</script>
```

```vue
<!-- Parent.vue -->
<template>
  <ListPanel :items="tasks">
    <template #row="{ item, index }">
      {{ index + 1 }}. {{ item.title }}
    </template>
  </ListPanel>
</template>
```

`:item="item"` and `:index="index"` on the `<slot>` are the scoped slot's
"props" — they're only reachable inside the `#row="{ ... }"` destructure on
the consumer's side, not from anywhere else in the parent's template. When
the consumer supplies `#row`, their content replaces the slot entirely — the
fallback `{{ item }}` in `ListPanel` never renders. That's the point: a
provided slot content and its fallback are mutually exclusive, never both.

### Generic components

`ListPanel` above types `items` as `unknown[]`, so `item` inside the `#row`
slot is `unknown` too — technically safe, but useless for autocomplete or
type-checking what the consumer does with `item.title`. A **generic
component** lets the component's prop type be a type parameter, inferred
from whatever the caller actually passes in:

```vue
<!-- ListPanel.vue -->
<script setup lang="ts" generic="T">
defineProps<{ items: T[] }>()
</script>

<template>
  <ul>
    <li v-for="(item, index) in items" :key="index">
      <slot name="row" :item="item" :index="index">
        {{ item }}
      </slot>
    </li>
  </ul>
</template>
```

The `generic="T"` attribute on `<script setup>` introduces a type parameter
scoped to this component. `items: T[]` means `T` is whatever element type the
caller's array actually has — pass `tasks: Task[]` and every `item` inside
the `#row` slot is typed as `Task`, with full autocomplete on `item.title`,
no manual casting required on either side.

## You'll also meet

**`defineSlots`.** Declaring `<slot name="row" :item="item" />` documents the
slot's shape in the template, but nothing tells TypeScript what type `item`
is when a consumer writes `#row="{ item }"` — it falls back to inferring
from usage, which is often looser than intended. `defineSlots` declares the
exact shape each named slot receives, the same way `defineProps` declares
props:

```vue
<script setup lang="ts" generic="T">
defineProps<{ items: T[] }>()
defineSlots<{
  row(props: { item: T; index: number }): unknown
  empty(): unknown
}>()
</script>
```

Now a consumer destructuring `#row="{ item, wrongName }"` gets a type error
on `wrongName` immediately, instead of discovering the typo by seeing
nothing render.

## Reference

→ `docs/PATTERNS.md` § "Named & scoped slots"
→ `docs/PATTERNS.md` § "Generic components"
→ Earlier lessons: none — Lesson 07 owns slots, generic components and `defineSlots`

## Now do Exercise 07
