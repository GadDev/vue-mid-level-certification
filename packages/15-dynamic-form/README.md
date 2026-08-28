# Exercise 15 — Dynamic Form

**Time limit: 35 min** · Skills: schema-driven rendering, `v-if`/`v-else-if` on control type, validation timing, `useId`

> **Before you start:** read [Lesson 15 — Rendering a form you didn't write](../../docs/lessons/15-dynamic-form.md).

## What you're building

A signup-style form that's generated entirely from a JSON schema instead of hand-written markup — add a field to the schema and a correctly typed input appears, with no template changes.

## Prompt

Render a form from JSON. `DynamicForm.vue` gets a field list and builds its own model from it.

```ts
interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'checkbox' | 'select'
  required?: boolean
  options?: string[]
}

defineEmits<{ submit: [values: Record<string, FieldValue>] }>()
```

## Requirements

- One labelled control per field, in schema order; the `<label for>` matches the control's `id`.
- The right control per type: `<select>` with its options, a checkbox, and an `<input>` carrying the field's own `type`.
- The model is seeded from the schema — `''` for text/email/select, `null` for number, `false` for checkbox — and **re-seeded when the schema prop changes**.
- Errors appear only **after the first submit attempt**, and disappear as soon as the field is filled.
- A required field is missing when it is blank *after trimming*, `null` for a number, or an unchecked checkbox.
- `submit` fires only when nothing required is missing. Its payload has trimmed strings, a `number | null` for number fields, and a boolean for checkboxes.

## DOM contract

| Selector                       | Meaning                                    |
| ------------------------------ | ------------------------------------------ |
| `[data-testid="field-<name>"]` | that field's `<input>` / `<select>`         |
| `[data-testid="error-<name>"]` | its error — only in the DOM while it errors |
| `[data-testid="submit"]`       | the submit button                           |

## Hidden edge cases

Whitespace-only input, an unchecked required checkbox, an untouched number staying `null`, errors before the first submit, and a completely different schema.

## Run

```bash
pnpm dev:15
pnpm --filter 15-dynamic-form test
pnpm --filter 15-dynamic-form typecheck
```

`v-model` on a dynamic key works, but the type coercion (`number`, `checkbox`) is the part the spec actually checks — bind `:value`/`:checked` and write the setter yourself if that is clearer.
