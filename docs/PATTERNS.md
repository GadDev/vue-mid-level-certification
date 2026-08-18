# Common Vue 3 Composition API Patterns

This guide documents reusable code patterns used throughout the exercises. Reference these when you're building your solutions.

Everything here is TypeScript, because every exercise is: `<script setup lang="ts">`, `strict: true`, and `verbatimModuleSyntax` (so type imports are inlined — `import { type Product, products } from '../data/products'`).

**Batch 1 — fundamentals**: [script setup](#script-setup-syntax) · [`ref`](#reactive-data-with-ref) · [`reactive`](#reactive-objects-with-reactive) · [`v-model`](#form-input-binding-with-v-model) · [form submit](#form-submission-with-submitprevent) · [computed](#computed-properties-for-filtering--sorting) · [`v-for`](#list-rendering-with-v-for-and-key) · [events](#event-handlers--inline-handlers) · [template refs](#template-refs-to-access-dom-elements) · [conditionals](#conditional-rendering-with-v-if-v-show-v-else) · [watchers](#watchers-for-side-effects) · [mutation](#array-mutations-where-in-place-is-fine-and-where-it-is-not) · [class/style](#class--style-binding) · [composables](#composable-functions) · [`.value`](#accessing-values-in-templates-vs-javascript)

**Batch 2 — composition & ecosystem**: [props & emits](#typed-props--emits) · [`defineModel`](#component-v-model-with-definemodel) · [`$attrs`](#attribute-fallthrough-with-attrs) · [slots](#named--scoped-slots) · [generic components](#generic-components) · [provide/inject](#provideinject-with-a-typed-key) · [plugins](#app-level-state-in-a-plugin) · [router](#route-params-that-actually-update) · [Pinia](#pinia-setup-stores) · [async & races](#async-watchers-debounce-abort-and-stale-responses) · [scope cleanup](#composables-that-own-side-effects)

**Batch 3 — component patterns**: [single-source selection](#single-source-selection-state) · [selection surviving a refresh](#selection-that-survives-a-data-refresh) · [schema-driven forms](#schema-driven-form-rendering) · [preview vs commit](#preview-state-vs-committed-state) · [slots with fallback actions](#slots-with-a-fallback-action)

**Batch 4 — stateful UI & composables**: [one timer per item](#one-timer-per-item) · [generic derived state](#generic-composables-with-clamp-on-read) · [injected loader + guard](#injected-loader-with-an-in-flight-guard) · [interval ownership](#interval-ownership-and-the-double-start-guard) · [cache + stale-response ticket](#per-instance-cache-with-a-request-ticket) · [feature detection](#feature-detection-for-browser-apis)

**Batch 5 — ecosystem at scale**: [getter returning a function](#a-getter-that-returns-a-function) · [persisting a store](#persisting-a-pinia-store) · [global route guard](#a-global-route-guard-with-meta) · [defensive parsing](#defensive-parsing-with-a-type-predicate) · [URL as state](#the-url-as-the-only-state)

**Batch 6 — debugging**: [reading broken reactive code](#reading-broken-reactive-code)

## Script Setup Syntax

All exercises use `<script setup>`, which is syntactic sugar for the Composition API:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const message = ref('Hello')
const greeting = computed(() => `${message.value}!`)
</script>

<template>
  <p>{{ greeting }}</p>
  <input v-model="message" />
</template>
```

**Why**: Shorter, more readable, and allows top-level `await` for async setup.

---

## Reactive Data with `ref()`

Use `ref()` to wrap primitive values and make them reactive:

```ts
const count = ref(0)
const name = ref('')
const isOpen = ref(false)

// Access the value in JavaScript with .value
count.value++

// Automatically unwrapped in templates (no .value needed)
```

Annotate the type when the initial value doesn't imply it — a union, a nullable, or an empty array:

```ts
const direction = ref<'asc' | 'desc'>('asc')
const selected = ref<Product | null>(null)
const rows = ref<Product[]>([])
```

**When to use**: Single values, strings, booleans, numbers.

**See**: Exercise 01, Exercise 05

---

## Reactive Objects with `reactive()`

Use `reactive()` for objects when you want property-based reactivity:

```ts
const user = reactive({ name: 'Alice', age: 30 })

// Access directly (no .value)
user.name = 'Bob'
```

**When to use**: Objects with multiple properties, when you want to avoid `.value`.

**Trade-off**: Destructuring `reactive()` objects breaks reactivity—use `ref()` instead if you need to destructure.

---

## Form Input Binding with `v-model`

Two-way binding directly from a template input to a ref:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
</script>

<template>
  <input v-model="message" />
  <p>You typed: {{ message }}</p>
</template>
```

**What happens**:

- User types → `message` updates
- `message` changes in JS → input value updates

**See**: Exercise 03, Exercise 05

---

## Form Submission with `@submit.prevent`

Prevent default browser behavior and handle form submission:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')

function handleSubmit(): void {
  console.log('Form submitted:', input.value)
  // Do something with the input
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="input" />
    <button type="submit">Submit</button>
  </form>
</template>
```

**Why `.prevent`**: Stops the browser from reloading the page (which is default form behavior).

**See**: Exercise 01, Exercise 06

---

## Computed Properties for Filtering & Sorting

Use `computed()` to derive reactive values that cache results:

```ts
import { computed, ref } from 'vue'

interface Item {
  id: number
  name: string
  price: number
}

const items = ref<Item[]>([
  { id: 1, name: 'Apple', price: 1.5 },
  { id: 2, name: 'Banana', price: 0.75 },
])

const searchQuery = ref('')

// Recomputes only when items or searchQuery change
const filtered = computed<Item[]>(() =>
  items.value.filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
```

**Performance**: Computed properties cache their result. If dependencies haven't changed, the function doesn't re-run.

**vs. Methods**: Use `computed()` when you want caching. Use a method when you need parameters, or when the work must repeat on every call.

**A computed must be pure.** It derives a value and touches nothing else — no `push`, no `sort` on a source array, no `fetch`. Side effects belong in an event handler or a `watch`.

**See**: Exercise 03, Exercise 04

---

## List Rendering with `v-for` and `:key`

Always provide a unique `:key` for list items:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const items = ref([
  { id: 1, label: 'Item 1' },
  { id: 2, label: 'Item 2' },
])
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.label }}
    </li>
  </ul>
</template>
```

**Why `:key`**: Helps Vue track which item is which. Without it, Vue reuses DOM nodes and state gets mixed up.

**Don't use index as key**: If the list can be reordered or filtered, `index` will cause bugs.

**See**: Exercise 02, Exercise 03, Exercise 07

---

## Event Handlers & Inline Handlers

Respond to user events with inline handlers:

```vue
<script setup lang="ts">
function handleClick(value: string): void {
  console.log('Clicked:', value)
}
</script>

<template>
  <button @click="handleClick('value')">Click me</button>
</template>
```

**With arguments**: Pass data directly, like `@click="deleteItem(item.id)"`.

**Inline expressions** work too, but remember refs are already unwrapped in the template — write `count++`, **not** `count.value++`:

```vue
<button @click="count++">Increment</button>
```

**See**: Exercise 01, Exercise 02

---

## Template Refs to Access DOM Elements

Use `ref=` to get direct access to a DOM element. Under `strict`, type the ref and null-check it — it is `null` until the component mounts:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const inputEl = ref<HTMLInputElement | null>(null)

function focusInput(): void {
  inputEl.value?.focus()
}
</script>

<template>
  <input ref="inputEl" />
  <button @click="focusInput">Focus</button>
</template>
```

**Vue 3.5+**: `useTemplateRef()` gets you the same typed, null-checked ref without declaring it with `ref()` first — the string argument must match the template's `ref="..."` attribute:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'

const inputEl = useTemplateRef<HTMLInputElement>('inputEl')

function focusInput(): void {
  inputEl.value?.focus()
}
</script>
```

For a ref per `v-for` row, pass a **function ref** and collect the elements yourself:

```vue
<script setup lang="ts">
const rowEls = new Map<number, HTMLElement>()

function setRow(id: number) {
  return (el: unknown): void => {
    if (el instanceof HTMLElement) rowEls.set(id, el)
    else rowEls.delete(id)
  }
}
</script>

<template>
  <li v-for="item in items" :key="item.id" :ref="setRow(item.id)">{{ item.label }}</li>
</template>
```

**Common uses**: focus an input, read scroll position, measure an element, call `scrollIntoView`.

**Wait for the DOM**: after changing state that affects the DOM, `await nextTick()` before you measure or scroll.

**See**: Exercise 01

---

## Conditional Rendering with `v-if`, `v-show`, `v-else`

Show or hide elements based on a condition:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(true)
const hasError = ref(false)
</script>

<template>
  <p v-if="isLoading">Loading...</p>
  <p v-else-if="hasError">Something went wrong</p>
  <p v-else>Success!</p>

  <!-- v-show: toggles display:none instead of removing from DOM -->
  <span v-show="isLoading">Spinner</span>
</template>
```

**`v-if` vs. `v-show`**:

- `v-if`: Removes element from DOM entirely (cheaper if hidden often, expensive to toggle)
- `v-show`: Keeps DOM node, toggles `display: none` (cheaper to toggle frequently)

**In tests this matters**: specs assert `exists()` on `[data-testid="empty"]`-style elements, and `v-show` leaves the node in the DOM. Use `v-if` for states that must be *absent*.

**See**: Exercise 01, Exercise 11

---

## Watchers for Side Effects

Use `watch()` when you need to run code in response to state changes:

```ts
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
  // Side effects: save to localStorage, fetch data, etc.
})
```

Nested changes need `{ deep: true }`, and `{ immediate: true }` runs the callback once up front:

```ts
watch(note, value => window.localStorage.setItem('note', JSON.stringify(value)), { deep: true })
```

**vs. Computed**: Computed is for deriving values. Watch is for reacting to changes with side effects.

**See**: Exercise 05, Exercise 11, Exercise 12

---

## Array Mutations: where in-place is fine, and where it is not

Both styles are reactive in Vue 3. The question is never "which is more modern" — it is *who owns the array you are about to change*.

```ts
// Fine: an event handler mutating state this component owns
items.value.push(newItem)
items.value.splice(index, 1)
item.name = draft.value           // editing one row's field
```

```ts
// Broken: sorting a shared source in place from inside a computed
const sorted = computed(() => items.value.sort(compare))   // ❌ mutates items
const sorted = computed(() => [...items.value].sort(compare)) // ✅ copy first
```

`Array.prototype.sort` and `reverse` mutate. When the array is a module-scoped source of truth (`src/data/*.ts` exports exactly that), sorting it in place silently reorders it for every other consumer — and doing it from a `computed` means a getter with a side effect, which can loop or produce order-dependent results. Copy with `[...items.value]` first.

**Rule of thumb**: mutate freely in event handlers on state you own; derive immutably inside `computed`.

**See**: Exercise 02 (mutates its own list), Exercise 04 (must not mutate the shared one)

---

## Class & Style Binding

Conditionally apply CSS classes and inline styles:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const isActive = ref(false)
const color = ref('red')
const theme = computed(() => (isActive.value ? 'dark' : 'light'))
</script>

<template>
  <!-- Conditional class -->
  <div :class="{ active: isActive, [theme]: true }">Content</div>

  <!-- Multiple classes -->
  <div class="base" :class="[{ error: isActive }, 'text-sm']">Text</div>

  <!-- Inline styles -->
  <div :style="{ color, fontSize: isActive ? '20px' : '16px' }">Styled</div>
</template>
```

**See**: Exercise 01 (highlighting), Exercise 08 (`theme-light` / `theme-dark`)

---

## Composable Functions

Extract reusable logic into composable functions. Keep the state **inside** the function so every caller gets an independent instance, and hand out read-only values with actions to change them:

```ts
// composables/useCounter.ts
import { computed, type ComputedRef, ref } from 'vue'

export interface Counter {
  count: ComputedRef<number>
  isEven: ComputedRef<boolean>
  increment: () => void
  decrement: () => void
}

export function useCounter(initialValue = 0): Counter {
  const count = ref(initialValue)

  function increment(): void {
    count.value++
  }

  function decrement(): void {
    count.value--
  }

  return {
    count: computed(() => count.value),
    isEven: computed(() => count.value % 2 === 0),
    increment,
    decrement,
  }
}
```

```vue
<script setup lang="ts">
import { useCounter } from '../composables/useCounter'

const { count, isEven, increment, decrement } = useCounter(0)
</script>

<template>
  <p>{{ count }} ({{ isEven ? 'even' : 'odd' }})</p>
  <button @click="increment">+</button>
  <button @click="decrement">−</button>
</template>
```

**No module-level state.** Declaring `const count = ref(0)` *outside* the function shares it between every caller and every test. The specs mount twice and assert the instances are independent.

**When to use**: Logic used in multiple components, or any stateful rule set worth testing without a component.

**See**: Exercise 05, Exercise 11, Exercise 12

---

## Accessing Values in Templates vs. JavaScript

In templates, `ref` values are automatically unwrapped:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

// In JavaScript: need .value
function increment(): void {
  count.value++ // ← .value
}
</script>

<template>
  <!-- In templates: no .value -->
  <p>{{ count }}</p>
  <button @click="count++">Increment</button>
  <!-- ← no .value here either -->
</template>
```

**Common mistake**: Forgetting `.value` in JavaScript, or adding it in templates.

---

# Batch 2 — composition & ecosystem

## Typed props & emits

Declare both from types, so the compiler checks the contract:

```vue
<script setup lang="ts">
export interface Signup {
  name: string
  email: string
}

const props = withDefaults(
  defineProps<{ label: string; error?: string; required?: boolean }>(),
  { error: '', required: false }
)

const emit = defineEmits<{ submit: [payload: Signup] }>()

function submit(payload: Signup): void {
  emit('submit', payload)
}
</script>
```

**Props are read-only.** Assigning to `props.error` is a compile error and a design error — the parent owns it. Derive with `computed`, or ask the parent to change it via an emit.

**See**: Exercise 06

---

## Component `v-model` with `defineModel`

`defineModel` gives you a writable ref that syncs with the parent's `v-model` — no `modelValue` prop plus `update:modelValue` emit by hand:

```vue
<!-- BaseInput.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="model" />
</template>
```

```vue
<!-- parent -->
<BaseInput v-model="email" label="Email" />
```

**See**: Exercise 06

---

## Attribute fallthrough with `$attrs`

By default, attributes the parent puts on your component land on its **root element**. For a wrapper component that is the wrong place — `placeholder`, `type` and `data-testid` belong on the inner `<input>`:

```vue
<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

const id = useId()
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <input :id="id" v-bind="$attrs" :aria-invalid="Boolean(error)" />
    <p v-if="error" role="alert" data-testid="error">{{ error }}</p>
  </div>
</template>
```

Without `inheritAttrs: false`, every attribute the parent passed ends up on the wrapper `<div>` — including the `data-testid` the parent's tests select on.

**See**: Exercise 06

---

## Named & scoped slots

A **named** slot takes content; a **scoped** slot also hands data back out. Everything between the tags is the fallback, rendered only when the consumer provides nothing:

```vue
<!-- DataTable.vue -->
<template>
  <table>
    <thead>
      <tr>
        <slot name="header"><th>Item</th></slot>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in items" :key="item.id">
        <slot name="row" :item="item" :index="index">
          <td data-testid="fallback-cell">{{ item.id }}</td>
        </slot>
      </tr>
      <tr v-if="items.length === 0">
        <slot name="empty"><td>No data.</td></slot>
      </tr>
    </tbody>
    <tfoot>
      <slot name="footer" :count="items.length">{{ items.length }} rows</slot>
    </tfoot>
  </table>
</template>
```

```vue
<!-- consumer -->
<DataTable :items="employees">
  <template #row="{ item, index }">
    <td>{{ index + 1 }}</td>
    <td>{{ item.name }}</td>
  </template>
  <template #footer="{ count }">{{ count }} employees</template>
</DataTable>
```

Declare the contract with `defineSlots` so consumers get types and typos get caught:

```ts
defineSlots<{
  header?: () => unknown
  row?: (props: { item: T; index: number }) => unknown
  empty?: () => unknown
  footer?: (props: { count: number }) => unknown
}>()
```

**Note**: the slot's `index` is 0-based; a "row number" column is `index + 1`.

**See**: Exercise 07

---

## Generic components

A presentational component that loops over *your* data shouldn't force it into `any`:

```vue
<script setup lang="ts" generic="T extends { id: number | string }">
const props = defineProps<{ items: T[]; caption?: string }>()
</script>
```

`T` flows into `defineSlots`, so `#row="{ item }"` is typed at the call site.

**See**: Exercise 07

---

## provide/inject with a typed key

An `InjectionKey<T>` carries the type through `inject()`. With a plain string key you get `unknown` back and lose everything:

```ts
// theme/index.ts
import { computed, type ComputedRef, type InjectionKey, inject, ref } from 'vue'

export type Theme = 'light' | 'dark'

export interface ThemeApi {
  theme: ComputedRef<Theme>
  isDark: ComputedRef<boolean>
  toggle: () => void
  set: (theme: Theme) => void
}

export const themeKey: InjectionKey<ThemeApi> = Symbol('theme')

export function useTheme(): ThemeApi {
  const api = inject(themeKey)
  if (!api) throw new Error('useTheme() requires the theme plugin — app.use(createTheme())')
  return api
}
```

Two rules the specs enforce: hand out **read-only** `ComputedRef`s plus actions (a writable `ref` lets any component silently corrupt shared state), and **throw** when the injection is missing — `undefined` is a wiring bug, and a silent default hides it.

**See**: Exercise 08

---

## App-level state in a plugin

`provide()` inside a component only reaches that component's subtree. For state the whole app shares, provide it from a plugin's `install()`:

```ts
import type { Plugin } from 'vue'

export function createTheme(initial: Theme = 'light'): Plugin {
  return {
    install(app) {
      app.provide(themeKey, createThemeApi(initial))
    },
  }
}
```

```ts
createApp(App).use(createTheme('dark')).mount('#app')
```

Because the state is created **per install**, two apps have independent themes — which is exactly what module-level state would break.

**See**: Exercise 08

---

## Route params that actually update

Navigating `/users/1` → `/users/2` matches the same route record, so Vue Router **reuses the component instance**: `setup()` does not run again.

```ts
// ❌ frozen at the first value
const id = Number(useRoute().params.id)

// ✅ re-derives on every param change
const route = useRoute()
const id = computed(() => Number(route.params.id))
const user = computed(() => users.find(u => u.id === id.value))
```

Params can also be arrays (`string | string[]`), so normalise before parsing. To re-fetch instead of re-derive, `watch(() => route.params.id, load, { immediate: true })`.

Guard invalid ids on the route, and inject the history so tests can use `createMemoryHistory()`:

```ts
import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'

export const routes = [
  { path: '/', redirect: { name: 'users' } },
  { path: '/users', name: 'users', component: UserListView },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: () => import('../views/UserDetailView.vue'), // lazy
    beforeEnter: to => (isKnownUser(to.params.id) ? true : { name: 'users' }),
  },
]

export function createAppRouter(history: RouterHistory = createWebHistory()) {
  return createRouter({ history, routes })
}
```

**See**: Exercise 09

---

## Pinia setup stores

A setup store is a composable that Pinia makes a singleton: `ref` for state, `computed` for getters, plain functions for actions.

```ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])

  const itemCount = computed(() => lines.value.reduce((sum, line) => sum + line.qty, 0))
  const subtotal = computed(() => round(lines.value.reduce((s, l) => s + l.price * l.qty, 0)))

  function add(product: Product, qty = 1): void {
    if (qty <= 0) return
    const existing = lines.value.find(line => line.id === product.id)
    if (existing) existing.qty += qty
    else lines.value.push({ ...product, qty })
  }

  return { lines, itemCount, subtotal, add }
})
```

**Destructuring loses reactivity.** `const { total } = useCartStore()` copies the current number. Use `storeToRefs` for state and getters, and take actions straight off the store:

```ts
const cart = useCartStore()
const { itemCount, subtotal } = storeToRefs(cart)
const { add, remove } = cart
```

**Singletons are per pinia instance**, which is why tests do `setActivePinia(createPinia())` — keep nothing in module scope.

**Round money in the getter**, not just in the template: `9.99 * 3` is `29.970000000000002`.

**See**: Exercise 10

---

## Async watchers: debounce, abort, and stale responses

Async search has four independent failure modes. `onWatcherCleanup` runs before the next invocation and when the scope dies, which makes it the place for both the timer and the abort:

```ts
import { onWatcherCleanup, ref, watch } from 'vue'

export function useUserSearch(delay = 300) {
  const query = ref('')
  const results = ref<User[]>([])
  const loading = ref(false)
  const error = ref('')
  let ticket = 0

  watch(query, raw => {
    const term = raw.trim()
    if (!term) {
      results.value = []
      error.value = ''
      loading.value = false
      return
    }

    loading.value = true
    const current = ++ticket
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsers(term, controller.signal)
        if (current !== ticket) return // a newer request won
        results.value = users
        error.value = ''
      } catch (cause) {
        if (controller.signal.aborted || current !== ticket) return // not an error
        results.value = []
        error.value = SEARCH_ERROR
      } finally {
        if (current === ticket) loading.value = false
      }
    }, delay)

    onWatcherCleanup(() => {
      clearTimeout(timer)
      controller.abort()
    })
  })

  return { query, results, loading, error }
}
```

- **Debounce before the request**, not after: the `setTimeout` is inside the watcher and cleared on the next run.
- **Capture the trimmed term**; reading `query.value` inside the timeout pairs the newest query with the oldest request.
- **A ticket, not just an abort.** A mocked or non-cooperative API still resolves, so a late response must check that it is still the current one — including in `finally`, or a stale settle clears `loading` for the live request.
- **`AbortError` is not a failure.** Treating it as one shows an error banner on every keystroke.

**See**: Exercise 11

---

## Composables that own side effects

A composable that adds a listener must remove it. `onScopeDispose` fires when the owning effect scope stops — the component unmounting, or an explicit `effectScope().stop()` — and unlike `onUnmounted` it works outside a component, so the specs can test it without mounting:

```ts
import { onScopeDispose, type ShallowRef, shallowRef } from 'vue'

export function useWindowSize(): { width: ShallowRef<number>; height: ShallowRef<number> } {
  const width = shallowRef(typeof window === 'undefined' ? 0 : window.innerWidth)
  const height = shallowRef(typeof window === 'undefined' ? 0 : window.innerHeight)

  if (typeof window === 'undefined') return { width, height }

  function update(): void {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  window.addEventListener('resize', update)
  onScopeDispose(() => window.removeEventListener('resize', update))

  return { width, height }
}
```

- **`shallowRef` for values that are always replaced.** These hold plain numbers; deep reactivity would only cost work.
- **Guard the environment.** `typeof window === 'undefined'` keeps it alive under SSR; the same applies to `window.localStorage`, which can also be missing or disabled.
- **Survive bad input.** Reading persisted JSON means `try`/`catch` with a fallback to the initial value — a corrupt entry is not worth crashing the app over.

Testing one looks like this:

```ts
const scope = effectScope()
const size = scope.run(() => useWindowSize())!
scope.stop() // listeners must be gone
```

**See**: Exercise 12

---

---

# Batch 3 — component patterns

## Single-source selection state

An accordion, a tab strip, a selected row — anywhere "exactly one of these is active" is a requirement, store the **id of the active one**, not a boolean flag per item:

```ts
const openId = ref<string | null>(null)

function toggle(id: string): void {
  openId.value = openId.value === id ? null : id
}
```

```vue
<section v-for="item in items" :key="item.id">
  <button :aria-expanded="openId === item.id" @click="toggle(item.id)">…</button>
  <p v-if="openId === item.id">…</p>
</section>
```

A flag per item (`item.open = true`) can drift into "two open at once" the moment two handlers run in the same tick. One id makes that state unreachable — there is only one value to disagree with itself.

**See**: Exercise 13

---

## Selection that survives a data refresh

A tab strip, a selected table row, a chosen filter chip — anywhere the underlying list can be replaced with fresh objects (a refetch, a re-sort), the selection has to be stored as an **id**, and re-validated against the new list with a `watch`:

```ts
const selectedId = ref<string | null>(props.items[0]?.id ?? null)

watch(
  () => props.items,
  list => {
    if (list.some(item => item.id === selectedId.value)) return
    selectedId.value = list[0]?.id ?? null
  }
)

const selected = computed(() => props.items.find(item => item.id === selectedId.value) ?? null)
```

Storing the selected **index** breaks the moment the list is re-sorted; storing the object itself breaks the moment the API returns a fresh copy with the same id. The id is the only part of "which one is selected" that survives both.

**See**: Exercise 14

---

## Schema-driven form rendering

Rendering a form from a JSON field list means dispatching on `field.type` for which control to render, and seeding + coercing the model from that same schema:

```vue
<div v-for="field in schema" :key="field.name">
  <select v-if="field.type === 'select'" …>
  <input v-else-if="field.type === 'checkbox'" type="checkbox" …>
  <input v-else-if="field.type === 'number'" type="number" …>
  <input v-else :type="field.type" …>
</div>
```

Seed the model from the schema rather than hand-writing it — a blank string for text, `null` for a number, `false` for a checkbox — and re-seed with a `watch(() => props.fields, …, { immediate: true })` when the schema itself can change:

```ts
function blank(field: FormField): FieldValue {
  if (field.type === 'checkbox') return false
  if (field.type === 'number') return null
  return ''
}
```

**`useId()`** links a dynamically-generated `<label for>` to its control without collisions between rows: `:id="`${formId}-${field.name}`"`.

**See**: Exercise 15

---

## Preview state vs. committed state

A star rating that highlights on hover but only commits on click needs **two** numbers, not one — what's shown, and what's saved:

```ts
const hovered = ref<number | null>(null)   // null = "not hovering"; 0 is a real rating
const displayed = computed(() => hovered.value ?? model.value)

function preview(value: number): void {
  hovered.value = value
}
```

The template always renders `displayed`, and only `select()` writes to the actual `v-model`. This is the same shape as a debounced search box that shows what you're typing before the request resolves: one value for "what the UI shows right now," one for "what's actually true," and a rule for how they reconcile.

**See**: Exercise 16

---

## Slots with a fallback action

A scoped slot can hand a caller both data **and a function to act on it** — a modal's footer slot receiving `close`, so a consumer can build a custom footer that still knows how to dismiss:

```vue
<footer>
  <slot name="footer" :close="close">
    <button @click="close">Close</button>
  </slot>
</footer>
```

```vue
<!-- consumer -->
<template #footer="{ close }">
  <button @click="submitThenClose(close)">Save</button>
</template>
```

Pair this with `@click.self` for a backdrop that closes on an outside click but not on clicks that bubble up from inside the dialog — a bare `@click` on the overlay fires for both.

**See**: Exercise 17

---

# Batch 4 — stateful UI & composables

## One timer per item

A toast queue where each notification auto-dismisses on its own clock needs a **timer per id**, not one shared timer — otherwise dismissing the oldest toast cancels the newest one's countdown too:

```ts
const timers = new Map<number, ReturnType<typeof setTimeout>>()

function notify(message: string): number {
  const id = nextId++
  toasts.value.push({ id, message })
  timers.set(id, setTimeout(() => dismiss(id), duration))
  return id
}

function dismiss(id: number): void {
  const timer = timers.get(id)
  if (timer !== undefined) clearTimeout(timer)
  timers.delete(id)
  toasts.value = toasts.value.filter(t => t.id !== id)
}
```

`onScopeDispose` clears every pending timer left in the map — a queue with three toasts in flight must not leak three timeouts when the component unmounts.

**See**: Exercise 18

---

## Generic composables with clamp-on-read

A composable like pagination or a windowed list is naturally generic over the item type, and the "current position" should be **derived**, not stored-and-corrected:

```ts
export function usePagination<T>(source: Ref<T[]>, initialSize = 10) {
  const page = ref(1)
  const pageSize = ref(initialSize)

  const pageCount = computed(() => Math.max(1, Math.ceil(source.value.length / pageSize.value)))
  // Clamp on read: if the source shrinks under the stored page, this recovers
  // automatically — no watcher needed to "fix" `page` when the list changes.
  const current = computed(() => Math.min(page.value, pageCount.value))

  const pageItems = computed(() => {
    const start = (current.value - 1) * pageSize.value
    return source.value.slice(start, start + pageSize.value)
  })

  return { page: current, pageCount, pageItems, /* … */ }
}
```

Writing the clamped value back into `page` on every source change works too, but needs a `watch` to do it. A `computed` clamp needs nothing extra — it's just never wrong.

**See**: Exercise 19

---

## Injected loader with an in-flight guard

Infinite scroll and "load more" both need the same two guards: never fire a second request while one is running, and know when there's nothing left to load. The loader itself should be a parameter, not an import, so the composable can be tested with hand-controlled promises:

```ts
export function useInfiniteScroll<T>(loadPage: (page: number) => Promise<T[]>, pageSize = 20) {
  const loading = ref(false)
  const done = ref(false)

  async function loadMore(): Promise<void> {
    if (loading.value || done.value) return   // the whole guard, in one line

    loading.value = true
    try {
      const batch = await loadPage(page.value + 1)
      items.value = [...items.value, ...batch]
      page.value++
      if (batch.length < pageSize) done.value = true   // short page ⇒ end of data
    } finally {
      loading.value = false
    }
  }

  return { loadMore, /* … */ }
}
```

**See**: Exercise 20

---

## Interval ownership and the double-start guard

Any composable wrapping `setInterval`/`setTimeout` (a countdown, a polling loop) needs to guard `start()` against being called while already running — and the guard has to check the **timer handle**, not a boolean flag, because those two can disagree:

```ts
let timer: ReturnType<typeof setInterval> | null = null

function start(): void {
  if (timer !== null) return   // not `if (running.value)` — the handle is the source of truth
  timer = setInterval(tick, 1000)
}

function stop(): void {
  if (timer !== null) clearInterval(timer)
  timer = null
}

onScopeDispose(stop)
```

Calling `start()` twice without this guard creates two intervals — the visible symptom is a clock (or a poll) that runs at double speed.

**See**: Exercise 21

---

## Per-instance cache with a request ticket

A `useFetch`-style composable owns two separate problems: caching a response by key, and making sure an out-of-order response doesn't clobber a newer one. The cache lives in a `Map` created **inside** the composable (never at module scope, so instances don't share it); the ticket is a counter bumped on every request, checked before every write:

```ts
export function useFetch<T>(load: (key: string) => Promise<T>) {
  const cache = new Map<string, T>()
  let ticket = 0

  async function run(key: string): Promise<void> {
    if (cache.has(key)) {
      data.value = cache.get(key) as T   // cache hit: no request, no loading flicker
      return
    }
    const current = ++ticket
    loading.value = true
    try {
      const result = await load(key)
      if (current !== ticket) return   // a newer request already won
      cache.set(key, result)
      data.value = result
    } finally {
      if (current === ticket) loading.value = false
    }
  }

  return { load: run, /* … */ }
}
```

This is the same ticket idea as exercise 11's debounced search — any time two async calls can resolve out of order, something has to record which one is current.

**See**: Exercise 22

---

## Feature detection for browser APIs

`navigator.clipboard`, `window.localStorage`, `IntersectionObserver` — none of these are guaranteed to exist (SSR, older browsers, insecure origins, privacy modes). Detect the feature and inject a fallback rather than assuming it:

```ts
function browserWriter(): ((text: string) => Promise<void>) | null {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return null
  return text => navigator.clipboard.writeText(text)
}

export function useClipboard(options: { write?: (text: string) => Promise<void> } = {}) {
  const writer = options.write ?? browserWriter()
  const isSupported = computed(() => writer !== null)
  // `copy()` checks `writer` before calling it, and fails softly when it's null.
}
```

Injecting `write` also makes the composable testable without stubbing a global — the same reasoning as `load` in `useFetch` or `loadPage` in `useInfiniteScroll`.

**See**: Exercise 23 (and 12's `window.localStorage` guard)

---

# Batch 5 — ecosystem at scale

## A getter that returns a function

A Pinia getter (or a computed) that needs a **parameter** — "is this specific id a favourite?" — returns a function instead of a value, computed once and called per row:

```ts
export const useWishlistStore = defineStore('wishlist', () => {
  const ids = ref<number[]>([])

  const isFavorite = computed(() => (id: number) => ids.value.includes(id))

  return { ids, isFavorite }
})
```

```vue
<button :aria-pressed="isFavorite(product.id)">♥</button>
```

`isFavorite` itself is a single `ComputedRef` — Vue only re-evaluates the outer computed when `ids` changes, and the returned closure is cheap to call per list item.

**See**: Exercise 24

---

## Persisting a Pinia store

Persist with a deep `watch` on the piece of state that matters, guard the storage API the same way exercise 12 does, and never let a write failure (quota, privacy mode) propagate out of the store:

```ts
watch(
  ids,
  value => {
    try {
      storage()?.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // A full or read-only quota must not break the feature itself.
    }
  },
  { deep: true }
)
```

Reading back at store creation needs the same defensiveness — corrupt JSON, a value that parsed but isn't the shape you expect, entries of the wrong type:

```ts
export function readStoredIds(): number[] {
  const raw = storage()?.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is number => typeof id === 'number')
  } catch {
    return []
  }
}
```

**See**: Exercise 24

---

## A global route guard with `meta`

Auth-gating a set of routes is one `router.beforeEach`, driven by `meta` flags on the route records — not a per-page check duplicated in every view:

```ts
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    role?: 'admin'
    guestOnly?: boolean
  }
}

router.beforeEach(to => {
  const auth = useAuthStore()   // resolved inside the guard: it needs the *active* pinia instance

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.role === 'admin' && !auth.isAdmin) return { name: 'dashboard' }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' }
  return true
})
```

Calling `useAuthStore()` inside the guard (not at module scope) matters for testing: at import time there is no active pinia yet, and capturing a store reference outside the guard can capture the wrong instance across tests.

**See**: Exercise 25

---

## Defensive parsing with a type predicate

A store that receives API data it doesn't control should validate with a type predicate, so the filtered array comes out **already narrowed** — no cast needed afterwards:

```ts
function isReading(entry: unknown): entry is Reading {
  if (typeof entry !== 'object' || entry === null) return false
  const candidate = entry as Record<string, unknown>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.label === 'string' &&
    typeof candidate.value === 'number' &&
    Number.isFinite(candidate.value)
  )
}

function setData(raw: unknown[]): void {
  readings.value = raw.filter(isReading)   // Reading[], not unknown[] — TS knows it
}
```

Round derived numbers (an average) **in the getter**, not in the template — `9.99 * 3` is `29.970000000000002`, and every consumer of the getter wants the same rounded figure, not each doing its own `.toFixed()`.

**See**: Exercise 26 (and 10's `subtotal` getter)

---

## The URL as the only state

When search, sort and pagination all belong in the query string, resist the urge to mirror them into a local `ref` — derive everything from `route.query` with `computed`, and write changes back with `router.push`. A deep link, the back button and a click all then go through the exact same path:

```ts
function first(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : value === undefined ? '' : String(value)
}

const q = computed(() => first(route.query.q).trim())
const sort = computed<Sort>(() => (first(route.query.sort) === 'price' ? 'price' : 'name'))

function update(next: { q?: string; sort?: Sort }): void {
  const query: Record<string, string> = {}
  if ((next.q ?? q.value) !== '') query.q = next.q ?? q.value
  if ((next.sort ?? sort.value) !== 'name') query.sort = next.sort ?? sort.value
  router.push({ query })   // defaults are left out — a pristine view has a clean URL
}
```

A query param is `string | string[] | undefined` — always normalise before using it. And changing a filter should reset pagination to page 1; paging should preserve the other filters.

**See**: Exercise 27 (and 9's route-param derivation)

---

## Route meta for generated UI

Breadcrumbs, page titles, and layout choices can all be driven by walking `route.matched` (the current route's parent chain, outermost first) and reading a `meta` field a route record declares — instead of hand-writing the trail on every page:

```ts
for (const record of route.matched) {
  const crumb = record.meta.breadcrumb
  if (!crumb) continue   // a layout or an unlabelled route contributes nothing
  const label = typeof crumb === 'function' ? crumb(route) : crumb
  trail.push({ label, path: fillParams(record.path, route.params) })
}
```

Fill dynamic segments (`:id`) from `route.params` before using a matched record's `path` as a link — the raw pattern isn't a navigable URL.

**See**: Exercise 28

---

# Batch 6 — debugging

## Reading broken reactive code

Exercises 29 and 30 invert the usual format: `src/` is complete, and wrong. There's no TODO to fill in — the work is finding why the described behaviour doesn't happen. Four shapes of bug show up there and are worth recognising on sight, because they all type-check cleanly:

- **Destructuring a `reactive()` object** copies the values out of the proxy at that instant; reassigning the destructured local touches nothing the template depends on. Read and write through the object (`state.count`), or use `toRefs`.
- **`ref(expression)` where a `computed` was needed.** `ref(a + b)` evaluates once, at setup — it does not recompute when `a` or `b` change later. If a value should track its dependencies, it has to be a `computed`.
- **`Array.prototype.sort`/`reverse` inside a `computed`** mutates the array it's sorting. If that array is shared reactive state, every other consumer sees it silently reordered. Copy first: `[...items].sort(...)`.
- **A `watch` source that returns the same reference every time**, such as `watch(() => sharedObject, …)` — Vue compares old and new values, and a getter returning the identical object reference every call never looks "changed" to a shallow `watch`. Watch the object directly (deep by default) or a primitive derived from it.
- **An emit name that doesn't match what `v-model` listens for.** `v-model="x"` listens for `update:modelValue`; emitting anything else (`emit('changed', …)`) sends a correct payload nowhere. `defineModel()` generates both halves of that contract for you.
- **State declared at module scope inside a Pinia store file.** `const count = ref(0)` outside `defineStore()`'s setup function is created once per *import* — every pinia instance (every test, every SSR request) then shares it. The state belongs inside the function passed to `defineStore`.

**See**: Exercises 29, 30

---

## Next Steps

- Read the exercise **README.md** files for specific challenges
- Use these patterns as building blocks for your implementations
- Read **[ANTI_PATTERNS.md](ANTI_PATTERNS.md)** for the *near-miss* version of each idiom above — the code that renders correctly once and breaks on the second interaction. If a test here fails in a way you can't explain, that catalogue is the fastest place to look.
- Compare against **solutions/** only *after* your own version is green — the reference implementation is a spoiler, not a starting point
