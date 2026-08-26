# Lesson 15 — Rendering a form you didn't write

> Prep for Exercise 15. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A hand-written form has one `<input>` per field, each with its own template
markup — reasonable when the fields are fixed and known ahead of time. A
form driven by data — a JSON schema describing which fields exist, in what
order, of what type — can't be written that way, because the component has
to produce the *right kind* of control for each field without knowing in
advance what the schema will contain. The template has to make that
decision at render time, per field, from data.

## The main idea

A single `<input>` for every field regardless of type doesn't get you very
far:

```vue
<script setup lang="ts">
interface Field {
  name: string
  label: string
  type: 'text' | 'checkbox' | 'select'
  options?: string[]
}

defineProps<{ fields: Field[] }>()
</script>

<template>
  <div v-for="field in fields" :key="field.name">
    <label>{{ field.label }}</label>
    <input :name="field.name" />
  </div>
</template>
```

This renders *something* for every field, but a `checkbox` field gets a
plain text box instead of a checkbox, and a `select` field with its own
`options` gets nothing resembling a dropdown at all — the schema says what
kind of control each field needs, and this template never looks at it.

The fix is **control dispatch**: branch on `field.type` and render the
matching element for each case.

```vue
<script setup lang="ts">
interface Field {
  name: string
  label: string
  type: 'text' | 'checkbox' | 'select'
  options?: string[]
}

defineProps<{ fields: Field[] }>()
</script>

<template>
  <div v-for="field in fields" :key="field.name">
    <label>{{ field.label }}</label>
    <select v-if="field.type === 'select'" :name="field.name">
      <option v-for="opt in field.options" :key="opt">{{ opt }}</option>
    </select>
    <input v-else-if="field.type === 'checkbox'" type="checkbox" :name="field.name" />
    <input v-else type="text" :name="field.name" />
  </div>
</template>
```

Each branch of the `v-if`/`v-else-if`/`v-else` chain matches one member of
the `type` union, and TypeScript checking `field.type` against that union
means adding a new type without a matching branch is the kind of gap that
shows up as an unhandled case rather than a silent rendering mistake — the
chain is exhaustive by construction as long as it mirrors the union.

### Validation timing

A schema-driven form usually validates every field against `required` and
type-specific rules. Running that validation reactively and showing errors
immediately is technically correct but a poor experience:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const value = ref('')
// shows an error while the user is still typing their first character
const error = computed(() => (value.value.trim() ? '' : 'Required'))
</script>

<template>
  <input v-model="value" />
  <p v-if="error">{{ error }}</p>
</template>
```

Every required field starts blank, so this shows every error the instant the
form renders — before the user has interacted with anything. The fix isn't
to change what counts as an error; it's to track *whether validation should
be shown yet* as its own piece of state, separate from whether a field is
currently valid:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const value = ref('')
const submitted = ref(false)

const error = computed(() => (value.value.trim() ? '' : 'Required'))
const visibleError = computed(() => (submitted.value ? error.value : ''))

function onSubmit() {
  submitted.value = true
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input v-model="value" />
    <p v-if="visibleError">{{ visibleError }}</p>
  </form>
</template>
```

`error` still recomputes on every keystroke — that part of the logic didn't
change. What changed is that the template reads `visibleError`, which is
`''` until `submitted` becomes `true`. A field that's already invalid on
first render stays silent until the first submit attempt, and once
`submitted` flips, `visibleError` tracks `error` live — so a field that
becomes valid while the user is fixing it clears its error immediately,
without waiting for another submit.

## You'll also meet

**Re-seeding the model when the schema changes.** A form's internal values
object is built from the schema once, typically in `<script setup>`'s
top-level code. If the `fields` prop is later replaced with a *different*
schema — not just updated data for the same fields — the old values object
still has the old fields' keys and none of the new ones. A `watch` on the
schema prop that rebuilds the values object from scratch handles this the
same way [Lesson 14](./14-tabs.md) handles a list changing under a
selection: react to the prop change explicitly rather than assuming the
initial build covers every case.

For `id`/`for` pairing and typed props on a form built this way, see
[Lesson 06](./06-base-input.md) — the same `useId()` and typed-props
patterns apply per rendered field here.

## Reference

→ `docs/PATTERNS.md` § "Conditional Rendering with `v-if`, `v-show`, `v-else`"
→ `docs/PATTERNS.md` § "Computed Properties for Filtering & Sorting"
→ Earlier lessons: [Lesson 06](./06-base-input.md) for `useId` and typed
  props, [Lesson 14](./14-tabs.md) for reacting to a changed prop

## Sources

- Vue.js official docs — [Conditional Rendering: `v-if`/`v-else-if`/`v-else`](https://vuejs.org/guide/essentials/conditional.html)
- Vue.js official docs — [Computed Properties](https://vuejs.org/guide/essentials/computed.html)
- Vue.js official docs — [TypeScript with Composition API — typing props](https://vuejs.org/guide/typescript/composition-api.html)
- Vue.js official docs — [Form Input Bindings (`v-model` on native elements)](https://vuejs.org/guide/essentials/forms.html)
- Vue School — [Form Validation in Vue.js](https://vueschool.io/articles/vuejs-tutorials/form-validation-with-vue-js/) (independent Vue courseware covering the submit-gated validation-display pattern taught here)
- VueUse docs — [`useVModel` and form-related composables](https://vueuse.org/core/useVModel/)

## Now do Exercise 15
