# Lesson 23 — APIs that might not be there

> Prep for Exercise 23. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

Some browser APIs simply don't exist everywhere — an older browser, an
insecure (non-HTTPS) origin, or server-side rendering can all mean a global
your code assumes is always present is actually `undefined`. Calling it
unconditionally doesn't fail gracefully; it throws, and it throws at the
exact moment a user tries to use the feature, which is the worst possible
time to discover the assumption was wrong.

## The main idea

Calling a browser API straight through assumes it's always there:

```ts
// useClipboard.ts — DOES NOT WORK everywhere
export function useClipboard() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    return true
  }

  return { copy }
}
```

On a browser without Clipboard API support, or in an environment where
`navigator.clipboard` is `undefined` — an insecure origin, a restrictive
embed, a server-rendering pass with no `navigator` object at all —
`navigator.clipboard.writeText` throws a `TypeError` for trying to read
`writeText` off `undefined`. There's no graceful degradation here: the
whole `copy` call throws, unhandled, from a place a caller may not expect an
exception at all.

**Feature detection** checks whether the capability exists before ever
trying to use it, and exposes that as its own piece of state so the UI can
react — disabling a button, for instance — instead of only discovering the
gap when a user clicks it:

```ts
// useClipboard.ts
import { computed, ref } from 'vue'

export function useClipboard() {
  const isSupported = computed(() => typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText)
  const error = ref('')

  async function copy(text: string) {
    if (!isSupported.value) {
      error.value = 'UNSUPPORTED'
      return false
    }
    try {
      await navigator.clipboard.writeText(text)
      error.value = ''
      return true
    } catch {
      error.value = 'COPY_ERROR'
      return false
    }
  }

  return { isSupported, error, copy }
}
```

`typeof navigator !== 'undefined'` guards against the identifier not
existing at all (the same reason [Lesson 12](./12-composable-storage.md)
checks `typeof window` before touching it), and the optional chain
`navigator.clipboard?.writeText` guards against `navigator` existing but the
Clipboard API specifically not being available on it. Both checks together
mean `copy` never throws for an unsupported environment — it reports
`'UNSUPPORTED'` through the same `error` state a real failed write would
use, and the caller can disable its UI up front by reading `isSupported`
rather than waiting for a failed attempt.

### Injected side effects

Testing `copy` against the *real* `navigator.clipboard.writeText` is
awkward — it depends on the test environment actually implementing it, and
a test that wants to simulate a rejection has no lever to pull. Accepting
the write function as a parameter, defaulting to the real one, solves this
the same way [Lesson 08](./08-theme-provider.md) and
[Lesson 20](./20-infinite-scroll.md) inject a dependency so a test can
supply its own:

```ts
import { ref } from 'vue'

export function useClipboard(options: { write?: (text: string) => Promise<void> } = {}) {
  const write = options.write ?? ((text: string) => navigator.clipboard.writeText(text))
  const error = ref('')

  async function copy(text: string) {
    try {
      await write(text) // calls the injected write, not navigator.clipboard directly
      error.value = ''
      return true
    } catch {
      error.value = 'COPY_ERROR'
      return false
    }
  }

  return { error, copy }
}
```

A test can now pass `write: () => Promise.reject(new Error('boom'))` to
exercise the `COPY_ERROR` path deterministically, with no dependency on
what the test environment's clipboard actually supports.

A copy-confirmation flash (`copied` true for a fixed window, then false
again) is a single timer that needs restarting — not accumulating — on
every new copy, the same guard-and-clear shape
[Lesson 18](./18-notification-queue.md) and
[Lesson 21](./21-use-countdown.md) use for timer ownership: clear whatever
timer is already pending before starting a new one, so a second copy resets
the window instead of stacking a second expiry on top of the first.

## Reference

→ `docs/PATTERNS.md` § "Composable Functions"
→ Earlier lessons: [Lesson 05](./05-counter-history.md) for composable
  factories, [Lesson 12](./12-composable-storage.md) for SSR guards,
  [Lesson 08](./08-theme-provider.md) for injected dependencies,
  [Lesson 18](./18-notification-queue.md) for timer ownership

## Now do Exercise 23
