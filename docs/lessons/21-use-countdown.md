# Lesson 21 — Owning `setInterval`

> Prep for Exercise 21. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

`setInterval` runs a callback repeatedly until something explicitly stops
it — there's no automatic single-instance guarantee. Call `start()` twice on
a naive timer composable and you don't get one timer that ignores the second
call; you get two intervals both ticking the same state, which looks like a
clock running at double speed. Preventing that requires tracking *whether a
timer is currently active* — and the obvious place to store that turns out
to be the wrong one.

![Lesson 21 — Owning `setInterval`](../assets/lesson_21.png)

## The main idea

A `running` boolean looks like the natural flag to guard against a second
`start()`:

```ts
// useClock.ts — DOES NOT WORK reliably
import { ref } from 'vue'

export function useClock() {
  const seconds = ref(0)
  const running = ref(false)

  function start() {
    if (running.value) return
    running.value = true
    setInterval(() => {
      seconds.value++
    }, 1000)
  }

  function stop() {
    running.value = false
    // ...clear what, exactly?
  }

  return { seconds, running, start, stop }
}
```

`start()` does guard against being called twice *while `running` is
already `true`*. But `stop()` has nothing to actually clear — the interval's
handle, the value `setInterval` returned, was never kept anywhere. Setting
`running.value = false` doesn't stop the browser from continuing to call the
callback every second; it just makes the composable's own flag disagree
with what's actually still running. The callback keeps firing,
`seconds.value` keeps incrementing, and nothing before this point in the
code has any way to reach the interval it started, because the value that
identifies it was thrown away.

The fix is to guard on **the handle itself**, not a separate boolean that
merely describes it — because the handle is the only thing that can
actually be cleared, and its presence or absence is the actual, singular
source of truth for "is a timer currently running":

```ts
// useClock.ts
import { ref } from 'vue'

export function useClock() {
  const seconds = ref(0)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function start() {
    if (intervalId !== null) return
    intervalId = setInterval(() => {
      seconds.value++
    }, 1000)
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return { seconds, start, stop }
}
```

`intervalId` is not exposed as reactive state at all — it's a plain
variable in the composable's closure, existing purely so `start` and `stop`
can agree on whether a timer is active by checking the one value that would
actually need clearing. A derived `running` computed can still be built on
top for the template (`computed(() => intervalId !== null)`, exposed
read-only), but the guard itself checks the handle, never a flag that could
end up out of sync with it — a boolean can be set to `false` without
anything actually stopping, but a `null` handle genuinely means nothing is
scheduled.

The same handle-based guard extends naturally to cleanup: an active
interval must not outlive the composable's scope. `onScopeDispose`
(from [Lesson 12](./12-composable-storage.md)) is the right place to call
`stop()` unconditionally — it's already guarded internally by the
`intervalId !== null` check, so calling it when nothing is running is
simply a no-op, exactly the same pattern
[Lesson 18](./18-notification-queue.md) uses to clear every pending timer
in its map on scope teardown.

## Reference

→ `docs/PATTERNS.md` § "Composable Functions"
→ Earlier lessons: [Lesson 05](./05-counter-history.md) for composable
  factories, [Lesson 12](./12-composable-storage.md) for
  `onScopeDispose`, [Lesson 18](./18-notification-queue.md) for owning
  multiple independent timers

## Sources

- Vue.js official docs — [`onScopeDispose()`](https://vuejs.org/api/reactivity-advanced.html#onscopedispose)
- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- MDN — [`setInterval()` / `clearInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
- VueUse docs — [`useIntervalFn`](https://vueuse.org/shared/useIntervalFn/) and [`useTimestamp`](https://vueuse.org/core/useTimestamp/) (production interval-owning composables with the same handle-based guard)
- Michael Thiessen — [Vue's Best Kept Secret: effectScope](https://michaelnthiessen.com/vue-effect-scope) (on why the source of truth for "is it running" should be the actual resource handle, not a mirrored flag)

## Now do Exercise 21

<a href="https://github.com/GadDev/vue-mid-level-certification/tree/main/packages/21-use-countdown" target="_blank">Open exercise on GitHub</a>
