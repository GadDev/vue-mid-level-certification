# Lesson 19 — Clamping is a derivation, not an assignment

> Prep for Exercise 19. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A page number has to stay within `1…pageCount` — but `pageCount` itself
isn't fixed, it depends on how many items there are and how many fit per
page, both of which can change while the user is paging. The instinct is to
keep the page number "corrected" by writing a fixed-up value back into it
whenever something changes. That instinct fights the very state it's trying
to protect, because now two different pieces of code — whatever sets the
page, and whatever corrects it — are both trying to own the same value.

![Lesson 19 — Clamping is a derivation, not an assignment](../assets/lesson_19.png)

## The main idea

Reaching for a `watch` to keep the stored page in range looks reasonable:

```ts
// usePager.ts — DOES NOT WORK cleanly
import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'

export function usePager<T>(source: Ref<T[]>, pageSize = 10) {
  const page = ref(1)
  const pageCount = computed(() => Math.max(1, Math.ceil(source.value.length / pageSize)))

  // tries to keep 'page' valid whenever the source or pageCount changes
  watch(pageCount, count => {
    if (page.value > count) page.value = count
  })

  function next() {
    page.value++ // clamped only by the watcher, which runs *after* this
  }

  return { page, pageCount, next }
}
```

The problem isn't that this never works — it's that `page` is now writable
from two directions that can disagree about timing. `next()` increments
`page` first; the watcher only corrects it afterward, on its own schedule,
so anything that reads `page` in between sees a value that's briefly out of
range. And every future function that changes something `pageCount` depends
on — resizing the page, changing the source — has to remember that a watcher
elsewhere is responsible for fixing `page`, or add its own correction and
end up with two places doing the same job.

The fix: never let the stored value be the thing that has to be valid. Store
the *raw requested* page, and derive the actual, always-valid page as a
`computed` that clamps on every read:

```ts
// usePager.ts
import { computed, ref } from 'vue'
import type { Ref } from 'vue'

export function usePager<T>(source: Ref<T[]>, pageSize = 10) {
  const requestedPage = ref(1)
  const pageCount = computed(() => Math.max(1, Math.ceil(source.value.length / pageSize)))
  const page = computed(() => Math.min(Math.max(1, requestedPage.value), pageCount.value))

  const pageItems = computed(() => {
    const start = (page.value - 1) * pageSize
    return source.value.slice(start, start + pageSize)
  })

  function next() {
    requestedPage.value = page.value + 1
  }

  return { page, pageCount, pageItems, next }
}
```

`page` is now read-only and always valid the instant it's read — there's no
window where it can hold a stale, out-of-range number, because nothing ever
writes to it directly. `requestedPage` is allowed to be "wrong" — it might
briefly say `7` when `pageCount` is `3` — because `page` never exposes that
raw number; it always exposes `Math.min(Math.max(1, requestedPage.value),
pageCount.value)`, recomputed fresh every time `pageCount` or
`requestedPage` changes. There's no watcher racing against `next()`, and no
second function anywhere responsible for "fixing" the page after the fact —
clamping happens exactly once, in the one place `page` is produced.

The general rule generalizes past pagination: when a value has both "what
was requested" and "what is actually valid" as separate concerns, keep the
requested value as the mutable source of truth and derive the valid value
with a `computed`, rather than trying to keep the requested value itself
always valid through assignment.

### As a generic composable

`usePager<T>` above takes its type parameter the same way a
[generic component](./07-data-table-slots.md#generic-components) does — `T`
is inferred from whatever `Ref<T[]>` the caller passes, so `pageItems` comes
back typed as `T[]` with no manual casting needed on the calling side.
Combined with [Lesson 03](./03-search-users.md)'s point about `computed`
being a cache, `pageCount` and `pageItems` here only recompute when
`source.value`, `pageSize`, or `requestedPage.value` actually change — not
on every unrelated re-render.

## Reference

→ `docs/PATTERNS.md` § "Computed Properties for Filtering & Sorting"
→ `docs/PATTERNS.md` § "Composable Functions"
→ Earlier lessons: [Lesson 03](./03-search-users.md) for `computed` as
  cached derivation, [Lesson 05](./05-counter-history.md) for composable
  factories, [Lesson 07](./07-data-table-slots.md) for generics

## Sources

- Vue.js official docs — [`computed()`](https://vuejs.org/api/reactivity-core.html#computed)
- Vue.js official docs — [Computed Properties](https://vuejs.org/guide/essentials/computed.html)
- Vue.js official docs — [TypeScript with Composition API — generic composables](https://vuejs.org/guide/typescript/composition-api.html)
- VueUse docs — [`useOffsetPagination`](https://vueuse.org/core/useOffsetPagination/) (a production pagination composable using the same requested-vs-derived-page split)
- Anthony Fu — [Reinventing Vue.js Reactivity in Vue 2.7/3](https://antfu.me/posts/reinventing-vue-reactivity-in-vueuse) (on treating derived state as a pure `computed` rather than something manually kept in sync)

## Now do Exercise 19

<a href="https://github.com/GadDev/vue-mid-level-certification/tree/main/packages/19-pagination" target="_blank">Open exercise on GitHub</a>

<MarkComplete id="19" />
