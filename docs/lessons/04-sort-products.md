# Lesson 04 — Sorting without breaking your source

> Prep for Exercise 04. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

`Array.prototype.sort()` is one of the few array methods that mutates in
place — it reorders the array it's called on and returns that same array,
rather than producing a new one. That's fine when the array is local and
disposable. It stops being fine the moment the array is a shared piece of
reactive state that other parts of the app also read: sorting it for *this*
computed reorders it for *everyone*, including code that never asked to be
sorted at all.

## The main idea

Say a list of race results is shared, reactive state — several components
read `runners`, and one of them offers a "sort by finish time" view:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

interface Runner {
  bib: number
  name: string
  finishTime: number
}

const runners = ref<Runner[]>([
  { bib: 7, name: 'Aiko', finishTime: 5102 },
  { bib: 3, name: 'Ben', finishTime: 4890 },
  { bib: 9, name: 'Coy', finishTime: 4890 },
])

// DOES NOT WORK — .sort() mutates runners.value in place
const byTime = computed(() => runners.value.sort((a, b) => a.finishTime - b.finishTime))
</script>
```

This looks like it produces "the runners, sorted" — and the computed *does*
return a sorted array. But `runners.value.sort(...)` doesn't build a new
array; it reorders `runners.value` itself and hands back a reference to that
same array. Anything else in the app reading `runners` — an unsorted
leaderboard, a "recently added" list keyed to insertion order — now sees a
reordered array it never asked to be reordered, because there is no longer
an unsorted copy anywhere to read.

The fix is to sort a *copy*:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

interface Runner {
  bib: number
  name: string
  finishTime: number
}

const runners = ref<Runner[]>([
  { bib: 7, name: 'Aiko', finishTime: 5102 },
  { bib: 3, name: 'Ben', finishTime: 4890 },
  { bib: 9, name: 'Coy', finishTime: 4890 },
])

const byTime = computed(() => {
  return [...runners.value].sort((a, b) => a.finishTime - b.finishTime || a.bib - b.bib)
})
</script>
```

`[...runners.value]` spreads the array into a brand-new array first; `.sort`
still mutates, but now it mutates the copy, and `runners.value` itself is
never touched. Every other consumer of `runners` keeps seeing the original
order untouched, no matter how many different sorted views get derived from
it elsewhere.

Two more details are baked into that comparator:

**Numeric vs. lexicographic comparison.** `sort()` with no comparator
converts elements to strings and compares them character by character, so
`[2, 10, 1].sort()` yields `[1, 10, 2]` — `'10'` sorts before `'2'` because
`'1' < '2'` as characters. A comparator that returns a number —
`(a, b) => a.finishTime - b.finishTime` — tells `sort` to compare
numerically instead: negative means `a` first, positive means `b` first,
zero means equal.

**Deterministic tie-breaking.** Aiko and Coy don't tie, but Ben and Coy do —
both finished in `4890`. `a.finishTime - b.finishTime` returns `0` for that
pair, which tells `sort` "these two are equal, keep them in whatever order
you find them" — and that order is only guaranteed to be their *current*
relative order, not some fixed rule. If the comparator stops there, which of
two equal-time runners prints first can depend on the array's prior order,
which makes the output subtly non-reproducible. `|| a.bib - b.bib` breaks
the tie explicitly: when the primary key is equal, fall back to a secondary
key that is never itself equal (an id, a bib number, anything unique) so the
result is the same every time regardless of the input order.

## Reference

→ `docs/PATTERNS.md` § "Array Mutations: where in-place is fine, and where it is not"
→ `docs/PATTERNS.md` § "Computed Properties for Filtering & Sorting"
→ Earlier lessons: [Lesson 03](./03-search-users.md) for `computed` as
  cached derivation — this lesson owns immutability & comparators

## Now do Exercise 04
