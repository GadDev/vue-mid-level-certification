![Lesson 16 — Two pieces of state that look like one](../assets/lesson_16.png)

# Lesson 16 — Two pieces of state that look like one

> Prep for Exercise 16. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

You met `defineModel` in [Lesson 06](./06-base-input.md), where the value
displayed and the value the parent owns were always the same thing. A hover
preview breaks that assumption on purpose: while the pointer is over the
control, what's *displayed* needs to track the pointer, but what's
*committed* — what the parent's `v-model` actually holds — must not change
until a real selection happens. That's harder than it looks, because
"displayed value" and "committed value" are usually the same number and only
occasionally diverge, which makes it tempting to store just one.

## The main idea

Storing only the model value and writing straight into it on hover looks
like the natural way to preview:

```vue
<!-- PriorityPicker.vue — DOES NOT WORK -->
<script setup lang="ts">
const model = defineModel<number>({ default: 0 })

function onHover(level: number) {
  model.value = level // mutates the committed value just from hovering
}
</script>

<template>
  <button v-for="level in 5" :key="level" @mouseenter="onHover(level)">
    {{ level }}
  </button>
</template>
```

Hovering over level 4 sets `model.value` to `4` — which, through
`defineModel`, emits an update to the parent immediately. The parent's
`v-model` binding now reflects the pointer's current position, not anything
the user actually chose. Move the mouse away without clicking, and the
parent is left holding whatever level the pointer happened to pass over
last — a hover accidentally became a commit.

The fix is a second, independent ref for the preview, read only while it's
active:

```vue
<!-- PriorityPicker.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'

const model = defineModel<number>({ default: 0 })
const previewLevel = ref<number | null>(null)

const displayLevel = computed(() => previewLevel.value ?? model.value)

function onHover(level: number) {
  previewLevel.value = level
}

function onLeave() {
  previewLevel.value = null
}

function select(level: number) {
  previewLevel.value = null
  model.value = level
}
</script>

<template>
  <div @mouseleave="onLeave">
    <button
      v-for="level in 5"
      :key="level"
      :class="{ filled: level <= displayLevel }"
      @mouseenter="onHover(level)"
      @click="select(level)"
    >
      {{ level }}
    </button>
  </div>
</template>
```

`previewLevel` and `model` are deliberately two separate pieces of state,
not one shared value pressed into double duty. The template renders
`displayLevel`, which prefers the preview when one is active and falls back
to the real committed value otherwise. Hovering only ever touches
`previewLevel` — `model` is untouched, so nothing is emitted to the parent
until `select` runs. Leaving the control clears the preview and
`displayLevel` falls back to `model` again, restoring exactly what was
committed before the hover started.

One detail makes `previewLevel: number | null` the right type rather than
just `number`: `0` is a legitimate committed value — "no rating" — so it
cannot *also* be the sentinel for "not currently hovering." `null` is a
distinct value the domain has no other use for, which is what makes it safe
as the "nothing to preview right now" marker; using `0` for that would make
a real value indistinguishable from the absence of one.

## You'll also meet

**Keyboard support alongside pointer events.** A control that only responds
to `@mouseenter`/`@click` is unusable without a mouse. Adding
`@keydown` on the same group, mapped to the same `select`-style function
that mouse clicks use, keeps both input methods driving the identical
committed-value logic rather than duplicating it:

```vue
<script setup lang="ts">
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    select(Math.min(5, model.value + 1))
  }
}
</script>
```

Calling `e.preventDefault()` only for keys the widget actually handles
matters — swallowing every keypress would also block unrelated browser
behavior like scrolling with arrow keys when focus happens to be elsewhere
on the page.

**The ARIA slider role.** A control that represents a value along a range
is a `role="slider"` — see [Lesson 13](./13-accordion.md#the-aria-contract)
for the general shape of an ARIA contract. A slider additionally needs
`aria-valuenow`, `aria-valuemin`, and `aria-valuemax` so assistive
technology can announce not just that the control exists, but where its
current value sits within its range.

## Reference

→ `docs/PATTERNS.md` § "Component `v-model` with `defineModel`"
→ Earlier lessons: [Lesson 06](./06-base-input.md) for `defineModel`,
  [Lesson 13](./13-accordion.md) for the ARIA contract pattern

## Sources

- Vue.js official docs — [Component `v-model`: `defineModel()`](https://vuejs.org/guide/components/v-model.html)
- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- MDN — [`KeyboardEvent` and `preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- W3C WAI-ARIA Authoring Practices — [Slider Pattern (`role="slider"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`)](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- Michael Thiessen — [Two-Way Data Binding in Vue with `v-model`](https://michaelnthiessen.com/two-way-binding-vue) (independent Vue educator on separating committed vs. preview state around `v-model`)

## Now do Exercise 16
