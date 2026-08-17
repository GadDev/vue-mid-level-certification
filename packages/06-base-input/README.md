# Exercise 06 — Base Input & Form Contract

**Time limit: 35 min** · Skills: typed props, typed emits, `defineModel`, `$attrs` fallthrough, validation bubbling

## Prompt

Two components, one contract.

**`BaseInput.vue`** — a reusable field:

- Typed props: `label: string`, `error?: string` (default `''`), `required?: boolean` (default `false`).
- `v-model` support via `defineModel<string>({ required: true })`. **Never mutate a prop** — the parent owns the value.
- A `<label>` whose `for` matches the input's `id` (use `useId()`).
- Extra attributes (`placeholder`, `type`, `data-testid`, …) must land on the **`<input>`**, not the wrapper `<div class="field">`. That needs `defineOptions({ inheritAttrs: false })` plus `v-bind="$attrs"` on the input.
- `aria-invalid` reflects whether there is an error; the error message renders only when `error` is non-empty, with `role="alert"` and `data-testid="error"`.

**`SignupForm.vue`** — the parent:

- Two `BaseInput`s (name, email), validated with computeds.
- Errors appear **only after the first submit attempt**, and disappear as soon as a field becomes valid.
- A typed emit: `defineEmits<{ submit: [payload: Signup] }>()`. Emit **only** when valid, with trimmed values.
- An error summary (`data-testid="summary"`, `role="alert"`) while the form is invalid after a submit attempt.

## DOM contract

| Selector                       | Meaning                                       |
| ------------------------------ | --------------------------------------------- |
| `label` / `input`              | one pair per field, `for` ↔ `id`               |
| `[data-testid="error"]`        | per-field error, only when there is one        |
| `[data-testid="name-input"]`   | the name `<input>` (via `$attrs`)              |
| `[data-testid="email-input"]`  | the email `<input>` (via `$attrs`)             |
| `[data-testid="form"]`         | submitting it validates (`@submit.prevent`)    |
| `[data-testid="summary"]`      | form-level error summary                       |
| `[data-testid="submit"]`       | submit button                                  |

## Validation rules

- Name: required, whitespace-only is invalid.
- Email: required and must match `something@something.tld` (reject `ada`, `ada@`, `ada@example`, `ada example.com`).

## Traps

- `data-testid="name-input"` on the child only reaches the input through `$attrs` — with default `inheritAttrs` it lands on the wrapper div and every parent test fails.
- Emitting on an invalid submit, or emitting untrimmed values, both fail.
- Showing errors before the first submit attempt fails the "no errors up front" test.

## Run

```bash
pnpm dev:06
pnpm --filter 06-base-input test      # 20 tests (8 child + 12 parent)
pnpm --filter 06-base-input typecheck
```
