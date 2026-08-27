# Lesson 22 — The request state machine

> Prep for Exercise 22. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A generic "fetch by key" composable is used differently than a one-off
search: the same key gets requested repeatedly as a user navigates back and
forth, and re-fetching data you already have on every single navigation is
wasted network traffic for data that hasn't changed. A cache fixes that —
but a cache interacts with loading state and error state in ways that aren't
obvious until you've hit the case where they disagree.

![Lesson 22 — The request state machine](../assets/lesson_22.png)

## The main idea

A first version fetches unconditionally every time `load` is called:

```ts
// useFetch.ts — DOES NOT WORK: no cache, no protection against stale responses
import { ref } from 'vue'

export function useFetch<T>(load: (key: string) => Promise<T>) {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref(false)

  async function fetchKey(key: string) {
    loading.value = true
    error.value = false
    try {
      data.value = await load(key)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load: fetchKey }
}
```

Two problems compound here. First, asking for a key that was already
successfully loaded moments ago re-requests it from the network every time —
there's no memory of what's already been fetched. Second, if the caller
requests key `A` and then quickly requests key `B` before `A`'s request
resolves, both requests are in flight with no way to tell which one should
win — if `A`'s response happens to arrive after `B`'s, it overwrites `data`
with stale content for a key the caller isn't even asking about anymore.
That second failure is the same race [Lesson 11](./11-async-search.md)
covers with a request ticket: the newest request must be the only one
allowed to write to `data`, `loading`, or `error`, regardless of the order
responses actually arrive in.

The fix combines a per-instance cache with that same ticket:

```ts
// useFetch.ts
import { ref } from 'vue'

export function useFetch<T>(load: (key: string) => Promise<T>) {
  const cache = new Map<string, T>()
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref(false)
  let ticket = 0

  async function fetchKey(key: string, { bypassCache = false } = {}) {
    if (!bypassCache && cache.has(key)) {
      data.value = cache.get(key)!
      error.value = false
      return // cache hit: never touches 'loading' at all
    }

    const myTicket = ++ticket
    loading.value = true
    try {
      const result = await load(key)
      if (myTicket !== ticket) return // superseded — drop silently
      cache.set(key, result)
      data.value = result
      error.value = false
    } catch {
      if (myTicket !== ticket) return
      error.value = true // failures are never cached — asking again really asks again
    } finally {
      if (myTicket === ticket) loading.value = false
    }
  }

  function retry(key: string) {
    return fetchKey(key, { bypassCache: true })
  }

  return { data, loading, error, load: fetchKey, retry }
}
```

Three decisions here follow directly from what a cache-plus-loading-state
composable needs to keep consistent:

- **A cache hit never flips `loading`.** It returns synchronously before
  `loading.value = true` is ever reached, because setting it and immediately
  clearing it again would make the UI flash a loading state for something
  that took no time at all.
- **A failure is never cached.** Only a successful `result` is written into
  `cache`. This means a failed key isn't "stuck" — the very next request for
  that key retries for real instead of replaying a cached failure.
- **`retry` bypasses the cache on purpose**, using the same `fetchKey`
  function with a flag rather than a separate code path — it's the same
  request logic, just told not to trust whatever's already cached for this
  key, exactly when the caller has explicit reason to believe the cached
  value (or the earlier failure) is no longer good enough.

The composable-factory shape here is the one from
[Lesson 05](./05-counter-history.md): `cache`, `ticket`, and every ref live
inside `useFetch`'s function body, so two separate calls to `useFetch()` get
two fully independent caches, never sharing state through a module-level
variable.

## Reference

→ `docs/PATTERNS.md` § "Async watchers: debounce, abort, and stale responses"
→ `docs/PATTERNS.md` § "Composable Functions"
→ Earlier lessons: [Lesson 11](./11-async-search.md) for the request
  ticket, [Lesson 05](./05-counter-history.md) for composable factories

## Sources

- Vue.js official docs — [Reusability: Composables](https://vuejs.org/guide/reusability/composables.html)
- Vue.js official docs — [TypeScript with Composition API — generic composables](https://vuejs.org/guide/typescript/composition-api.html)
- VueUse docs — [`useFetch`](https://vueuse.org/core/useFetch/) (VueUse's own cache/race-condition handling for keyed requests, worth comparing against the ticket approach here)
- VueUse docs — [`createFetch` / caching strategies](https://vueuse.org/core/createFetch/)
- Anthony Fu — [Reinventing Vue.js Reactivity in Vue 2.7/3](https://antfu.me/posts/reinventing-vue-reactivity-in-vueuse) (VueUse author on structuring stateful async composables)

## Now do Exercise 22
