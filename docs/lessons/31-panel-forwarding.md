# Lesson 31 — A wrapper that doesn't know what it wraps

> Prep for Exercise 31. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

[Exercise 07](./07-data-table-slots.md) taught named and scoped slots from
the consumer's side: you know exactly which slots a component exposes, so
you write `#row="{ item }"` because you read the docs. But what if you're
not the final consumer — what if you're writing a wrapper that sits between
a generic component and whoever eventually uses it, and your wrapper isn't
allowed to know which slots the thing underneath exposes, or what props it
accepts beyond the one or two it adds itself?

A naive wrapper hardcodes what it forwards:

```vue
<!-- CardFrame.vue — wraps Card but only forwards what it happens to name -->
<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div class="frame">
    <h2>{{ title }}</h2>
    <Card>
      <template #body><slot name="body" /></template>
    </Card>
  </div>
</template>
```

This "works" until `Card` grows a `footer` slot, or a consumer passes
`Card` an `items` prop `CardFrame` never declared — both silently vanish,
because `CardFrame` only forwards the one slot name it bothered to type out.
A wrapper that stays correct as the thing it wraps changes can't enumerate
slot names or prop names at all; it has to forward *whatever it received*,
generically.

## The main idea

Two mechanisms cover the two things a wrapper can receive without knowing
their names ahead of time: `$attrs` for props/listeners, `$slots` for slot
content.

### `$attrs` — the props you didn't declare

Every prop and listener a consumer passes that the component doesn't list
in `defineProps` lands in `$attrs`. By default, Vue applies `$attrs`
automatically to the component's single root element — that's why a plain
`class` or `id` you never declared still shows up in the DOM. `inheritAttrs:
false` turns that off, which only makes sense once you bind `$attrs`
somewhere yourself — otherwise those props have nowhere to go:

```vue
<!-- CardFrame.vue -->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ title: string }>()
</script>

<template>
  <div class="frame">
    <h2>{{ title }}</h2>
    <Card v-bind="$attrs" />
  </div>
</template>
```

Now a consumer's `<CardFrame title="..." :items="rows" />` sends `items` to
`Card` via `v-bind="$attrs"`, instead of it either leaking onto `.frame` or
disappearing because `CardFrame` never declared it.

### `$slots` — the slots you didn't name

`$slots` is an object keyed by slot name, one entry per slot the *consumer
actually supplied* — a slot the consumer left empty simply isn't a key on
`$slots` at all. Looping over it forwards exactly what was given, nothing
more:

```vue
<template>
  <div class="frame">
    <h2>{{ title }}</h2>
    <Card v-bind="$attrs">
      <template v-for="(_, name) in $slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </Card>
  </div>
</template>
```

`#[name]` is a **dynamic slot name** — the square brackets mean "use the
value of `name`, not the literal word `name`," the same syntax as
`:[attr]="value"` for a dynamic prop. `slotProps` is whatever scoped-slot
params `Card` handed to that slot; forwarding it with `v-bind="slotProps"`
onto `<slot :name="name">` passes those same params through to whoever
fills that slot on `CardFrame`, unchanged.

That last point is the one that's easy to get backwards: `v-for="(_, name)
in $slots"` only iterates slots the consumer *did* supply. A slot the
consumer left out never becomes a key in `$slots`, so this loop never
touches it — and an untouched `<slot name="...">` inside `Card` falls back
to `Card`'s own default content, exactly as if `CardFrame` weren't there at
all. Iterating `$slots` is what makes "forward only what was given" and
"don't swallow unfilled fallbacks" the same behavior, for free.

## You'll also meet

**Generic components composed through a non-generic wrapper.** The
component being wrapped might declare `<script setup generic="T">`, typing
its scoped-slot params against whatever array the consumer passes. The
wrapper in between doesn't need `generic` itself — it never inspects
`item`'s shape, it only relays whatever slot params it's handed via
`v-bind="slotProps"`, so `T` stays whatever the consumer's own usage
resolves it to on the far side of the wrapper.

## Reference

→ `docs/PATTERNS.md` § "Named & scoped slots"
→ Earlier lessons: [Lesson 07](./07-data-table-slots.md) for named &
  scoped slots and generic components — this lesson only adds forwarding
  them through an intermediate, non-generic wrapper

## Sources

- Vue.js official docs — [Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html)
- Vue.js official docs — [Disabling Attribute Inheritance](https://vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance)
- Vue.js official docs — [Rendering Slot Content](https://vuejs.org/guide/components/slots.html#rendering-slot-content)
- Vue.js official docs — [Dynamic Slot Names](https://vuejs.org/guide/components/slots.html#dynamic-slot-names)
- Vue.js official docs — [`$slots`](https://vuejs.org/api/component-instance.html#slots)
- Michael Thiessen — [Vue 3's `$attrs` now includes class and style](https://michaelnthiessen.com) (independent Vue educator on how `$attrs` and `inheritAttrs` interact in Vue 3)

## Now do Exercise 31

<a href="https://github.com/GadDev/vue-mid-level-certification/tree/main/packages/31-panel-forwarding" target="_blank">Open exercise on GitHub</a>
