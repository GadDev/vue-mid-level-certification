![Lesson 12 — Composables that clean up after themselves](../assets/lesson_12.png)

# Lesson 12 — Composables that clean up after themselves

> Prep for Exercise 12. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A composable that adds a `window` event listener has to remove it again, or
every component that ever used the composable leaves a listener running
forever, quietly leaking memory and firing callbacks against components that
no longer exist. The obvious place to remove it is a component lifecycle
hook — except a composable isn't always used from inside a component. It
might be composed into another composable, or driven directly from a test
with no component involved at all, and a component lifecycle hook has
nothing to attach to in either case.

## The main idea

`onUnmounted` looks like the right cleanup hook, because it's the one most
composables reach for first:

```ts
// useOnlineStatus.ts — DOES NOT WORK outside a component
import { onUnmounted, ref } from 'vue'

export function useOnlineStatus() {
  const online = ref(navigator.onLine)

  function update() {
    online.value = navigator.onLine
  }

  window.addEventListener('online', update)
  window.addEventListener('offline', update)

  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return { online }
}
```

Call this from a component's `<script setup>` and it works, because
`<script setup>` runs inside an active component instance and `onUnmounted`
has a component to attach to. Call it directly in a test —
`const { online } = useOnlineStatus()`, with no `mount()` involved — and Vue
throws a warning that `onUnmounted` is called when there is no active
component instance, and the cleanup silently never registers. The listeners
stay attached for the lifetime of the page.

The fix is `onScopeDispose`, which attaches to Vue's more general
**effect scope** rather than specifically to a component:

```ts
// useOnlineStatus.ts
import { onScopeDispose, ref } from 'vue'

export function useOnlineStatus() {
  const online = ref(navigator.onLine)

  function update() {
    online.value = navigator.onLine
  }

  window.addEventListener('online', update)
  window.addEventListener('offline', update)

  onScopeDispose(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return { online }
}
```

Every component instance runs inside its own effect scope, so
`onScopeDispose` still fires on unmount when called from a component —
nothing changes for that case. But an effect scope can also exist on its
own, created directly with `effectScope()`, with no component anywhere:

```ts
import { effectScope } from 'vue'

const scope = effectScope()

scope.run(() => {
  const { online } = useOnlineStatus()
  console.log(online.value)
})

scope.stop() // runs the onScopeDispose callback registered above
```

`scope.stop()` disposes the scope and runs every `onScopeDispose` callback
registered while code was running inside it — which is exactly how a test
can exercise a composable's cleanup without mounting any component at all.

### Deep watch

A composable that persists an object needs to notice changes *inside* that
object, not just wholesale replacement of it:

```ts
import { ref, watch } from 'vue'

const settings = ref({ volume: 50, muted: false })

// misses this: settings.value.volume = 80 (same object, nested change)
watch(settings, value => {
  localStorage.setItem('settings', JSON.stringify(value))
})
```

By default `watch` on a ref holding an object only re-fires when
`settings.value` is reassigned to a different object — mutating a property
inside the existing object doesn't trigger it, for the same shallow-
comparison reason a plain `watch` on a `reactive()` object misses nested
changes. `{ deep: true }` makes the watcher also fire when anything nested
inside the watched value changes:

```ts
watch(settings, value => {
  localStorage.setItem('settings', JSON.stringify(value))
}, { deep: true })
```

### SSR guards

A composable that unconditionally reads `window` or `localStorage` at module
or setup time crashes in any environment that renders the component without
a browser — server-side rendering, a Node-based test runner, anywhere
`window` is `undefined`. Guard every access:

```ts
function readStored(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  return window.localStorage.getItem(key) ?? fallback
}
```

Checking `typeof window === 'undefined'` (rather than just `!window`) is
what makes this safe to run in an environment where `window` isn't merely
falsy but doesn't exist as an identifier at all — referencing an undeclared
global directly throws a `ReferenceError` before the `!` ever gets a chance
to evaluate it.

## You'll also meet

**`shallowRef` for always-replaced values.** A regular `ref` on an object
makes every nested property reactive, which costs something to set up and is
wasted work when a value is never mutated in place — only ever swapped for a
completely new value, like a pair of numbers read fresh from the browser on
every resize:

```ts
import { shallowRef } from 'vue'

const size = shallowRef({ width: 0, height: 0 })

function updateSize() {
  size.value = { width: window.innerWidth, height: window.innerHeight } // whole new object
}
```

`shallowRef` only tracks reactivity on `.value` itself — assigning a new
object triggers updates as normal, but mutating a property of the current
object (`size.value.width = 10`) does not. That's the right trade-off here,
because nothing in this composable ever does the latter.

## Reference

→ `docs/PATTERNS.md` § "Composable Functions"
→ `docs/PATTERNS.md` § "Watchers for Side Effects"
→ Earlier lessons: [Lesson 05](./05-counter-history.md) for composable
  factories

## Sources

- Vue.js official docs — [`onScopeDispose()`](https://vuejs.org/api/reactivity-advanced.html#onscopedispose)
- Vue.js official docs — [`effectScope()`](https://vuejs.org/api/reactivity-advanced.html#effectscope)
- Vue.js official docs — [Reusability: Composables](https://vuejs.org/guide/reusability/composables.html)
- Vue.js official docs — [`watch()` and the `deep` option](https://vuejs.org/guide/essentials/watchers.html#deep-watchers)
- Vue.js official docs — [`shallowRef()`](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- Vue.js official docs — [SSR guide: Writing SSR-Friendly Code](https://vuejs.org/guide/scaling-up/ssr.html#writing-ssr-friendly-code)
- Anthony Fu — [Reinventing Vue.js Reactivity in Vue 2.7/3: Effect Scope](https://antfu.me/posts/reinventing-vue-reactivity-in-vueuse) (the person who authored `effectScope` for VueUse's composable lifecycle needs)
- VueUse docs — [`useEventListener`](https://vueuse.org/core/useEventListener/) and [`tryOnScopeDispose`](https://vueuse.org/shared/tryOnScopeDispose/) (production examples of the same `onScopeDispose` cleanup pattern taught here)
- Michael Thiessen — [Vue's Best Kept Secret: effectScope](https://michaelnthiessen.com/vue-effect-scope) (independent Vue educator's walkthrough of why component lifecycle hooks aren't enough for composables)

## Now do Exercise 12
