# Lesson 06 — Building a component the parent still owns

> Prep for Exercise 06. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A prop flows one way: parent to child. That is not a stylistic preference —
Vue enforces it, because a component that could silently rewrite its own
props would make the parent's data impossible to reason about. Two mounted
copies of the same child could each mutate the same prop differently, and the
parent would have no way to know which write "won."

But a reusable form field needs the *opposite* of one-way flow: the parent
types into the input, and the parent's own state has to update to match, live,
on every keystroke. So how do you build a child component that both displays a
value the parent controls and pushes changes back out — without ever
mutating the prop it was given?

## The main idea

The naive attempt is to treat the prop like local state:

```vue
<!-- BaseInput.vue — DOES NOT WORK -->
<script setup lang="ts">
defineProps<{ value: string }>()
</script>

<template>
  <input :value="value" @input="value = ($event.target as HTMLInputElement).value" />
</template>
```

This fails immediately and loudly: Vue warns
`Unexpected mutation of "value" prop` and the input's displayed value does
not actually change, because the parent's data — the true source of truth —
was never touched. The child rewrote its own copy of a value it does not own.

Vue's answer is `defineModel()`: a macro that declares a prop *and* the event
that requests a change to it, wired together so that `v-model` on the parent
side "just works":

```vue
<!-- BaseInput.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <input :value="model" @input="model = ($event.target as HTMLInputElement).value" />
</template>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from './BaseInput.vue'

const name = ref('')
</script>

<template>
  <BaseInput v-model="name" />
</template>
```

`model.value = ...` inside `BaseInput` never mutates a prop — under the hood
`defineModel` expands to a normal `modelValue` prop plus an
`emit('update:modelValue', ...)` call, and assigning to `model.value` is
sugar for that emit. The parent's `name` ref is still the only place the
value actually lives; the child only ever *asks* for a new value by emitting.
That is the difference that makes it legal: the child requests, the parent
decides.

## You'll also meet

**Typed props and emits.** Beyond the model value, a component usually needs
plain, one-way inputs (`label`, `required`) and events for things that are
not "the value changed" (like `submit`). Both are declared with a type
argument rather than a runtime shape object, so TypeScript checks every call
site:

```vue
<script setup lang="ts">
interface Props {
  label: string
  required?: boolean
}

defineProps<Props>()
const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <label>{{ label }}<span v-if="required"> *</span></label>
  <button type="button" @click="emit('clear')">Clear</button>
</template>
```

Passing the wrong shape to `clear` — say `emit('clear', 'oops')` when the
type says `clear: []` — is a compile error, not a runtime surprise.

**`$attrs` fallthrough.** Any attribute a caller passes that is *not* a
declared prop — `placeholder`, `type`, `data-testid`, an event listener —
still needs somewhere to go. By default Vue puts it on the component's single
root element automatically. That default breaks the moment your root element
is a wrapper `<div>` around the real `<input>`: the attribute lands on the
`<div>`, not the input the caller actually meant to configure.

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="field">
    <input v-bind="$attrs" />
  </div>
</template>
```

`inheritAttrs: false` turns off the automatic placement; `v-bind="$attrs"`
then puts every fallthrough attribute exactly where you choose — here, the
inner `<input>` rather than the wrapper.

**`useId()`.** A `<label for="...">` needs to reference its input's `id`, but
a hardcoded id breaks the instant two copies of the component are mounted on
the same page — two elements would share one id, which is invalid HTML and
breaks the label's association. `useId()` generates an id that is unique per
component instance and stable across re-renders of that instance:

```vue
<script setup lang="ts">
import { useId } from 'vue'

const fieldId = useId()
</script>

<template>
  <label :for="fieldId">Name</label>
  <input :id="fieldId" />
</template>
```

## Reference

→ `docs/PATTERNS.md` § "Component `v-model` with `defineModel`"
→ `docs/PATTERNS.md` § "Typed props & emits"
→ `docs/PATTERNS.md` § "Attribute fallthrough with `$attrs`"
→ Earlier lessons: none — Lesson 06 owns `defineModel`, typed props & emits,
  and `useId`

## Sources

- Vue.js official docs — [`defineModel()`](https://vuejs.org/api/sfc-script-setup.html#definemodel)
- Vue.js official docs — [Component v-model](https://vuejs.org/guide/components/v-model.html)
- Vue.js official docs — [Typed props and emits](https://vuejs.org/guide/typescript/composition-api.html#typing-component-props)
- Vue.js official docs — [Fallthrough Attributes](https://vuejs.org/guide/components/attrs.html)
- Vue.js official docs — [`useId()`](https://vuejs.org/api/composition-api-helpers.html#useid)
- Michael Thiessen — [How to Use v-model in Vue 3 Components](https://michaelnthiessen.com/v-model) (independent Vue educator's walkthrough of `defineModel` and its predecessors)
- VueUse docs — [`useVModel`](https://vueuse.org/core/useVModel/) (a widely used composable built directly on the `v-model`/prop-emit contract taught here)

## Now do Exercise 06
