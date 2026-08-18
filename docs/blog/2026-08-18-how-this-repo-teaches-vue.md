---
title: How this repo teaches Vue
date: '2026-08-18'
tags: [vue, testing, learning]
summary: >-
  Why this repo is organized as thirty red-to-green exercises in six batches instead of one
  big tutorial, and what each batch is actually training you to notice.
---

# How this repo teaches Vue

Most Vue tutorials teach by demonstration: here is `ref`, here is `computed`, here is a todo
list that uses both. This repo teaches by **contradiction** instead — every exercise ships a
test suite that starts red, and the tests encode a requirement you only discover by reading
the failure. That single decision shapes everything else about how it's organized. As of this
writing there are 30 exercises across six batches and 479 tests; see the full breakdown in
[Learning Path & Exam Coverage](/LEARNING_PATH).

## Batch 1 is deliberately claustrophobic

The first five exercises stay inside one component on purpose. [Scroll to Item](/LEARNING_PATH)
is a function `ref` collecting one template ref per `v-for` row, and a lesson about why a
repeated submission must *reset* a highlight timer instead of stacking a second one on top.
[Sort Products](/LEARNING_PATH) exists almost entirely to make a point: `Array.prototype.sort`
mutates, and sorting a shared reactive source in place from inside a `computed` is a side
effect coming from a place that is supposed to have none. See [Array Mutations](/PATTERNS) in
the patterns doc for the copy-first fix.

By the time you reach [Counter History](/LEARNING_PATH), the shape of a real composable is the
point: state and rules live inside `useCounterHistory()`, `count` comes out as a read-only
`ComputedRef`, and there's no module-level state — every caller gets an independent instance.
The spec unit-tests the composable directly, without mounting anything, which is the whole
argument for writing it that way.

## Batch 2 is where the coding exam actually lives

Composition and ecosystem work — six components deep, an average of 35 minutes each — is where
the mid-level exam's 105-minute coding block spends its time. [Base Input](/LEARNING_PATH)
teaches that the parent owns the value: `defineModel<string>({ required: true })` instead of
mutating a prop, `defineOptions({ inheritAttrs: false })` so a wrapper `<div>` doesn't swallow
the `data-testid` a test expects on the inner `<input>`. [Router Master/Detail](/LEARNING_PATH)
teaches the trap that catches almost everyone once: navigating `/users/1` → `/users/2` matches
the same route record, so Vue Router **reuses the component instance** and `setup()` never runs
again — a plain `const id = Number(route.params.id)` freezes at the first value forever.
[Pinia Cart](/LEARNING_PATH) teaches that destructuring a store snapshots it; `storeToRefs` is
not a style preference, it's the only thing that keeps `total` reactive.

[Async Search](/LEARNING_PATH) stacks four separate failure modes into one composable —
debounce before the request, abort the in-flight one, ignore stale responses with a request
ticket, and never treat an `AbortError` as an error — because in production code these four
bugs travel together, not one at a time.

## Batches 3–5 go wide, not deep

Once the fundamentals hold, the later batches stop introducing new Vue primitives and start
asking what happens when several of them collide. [Dynamic Tabs](/LEARNING_PATH) asks what
happens to the selected tab when the tab *list* changes underneath it — selection has to be
derived, not stored, so a removed tab can't leave a dangling id. [`useCountdown()`](/LEARNING_PATH)
is really about ownership: starting an already-running timer must not create a second interval,
and the guard has to check the timer handle, not a boolean flag, because those two can disagree.
[Auth Store & Route Guards](/LEARNING_PATH) splits identity from access — the store knows *who*
you are, the router's global `beforeEach` decides *where* that lets you go — plus the redirect
round-trip back to wherever the visitor was headed before login.

## Batch 6 inverts the format on purpose

The last two exercises ship `src/` **complete but wrong**. There's no `TODO` to fill in — the
work is reading. The bugs are the same four or five shapes every time: a destructured
`reactive()` that silently stopped being reactive, a `ref(expression)` doing a `computed`'s job
and evaluating once at setup, an emit name that doesn't match what `v-model` listens for, module
state declared outside a Pinia store's setup function so every instance shares it. Recognizing
these on sight is arguably a more exam-relevant skill than writing new code from scratch — see
[Reading broken reactive code](/PATTERNS) for the full catalogue.

## Why red-to-green, specifically

A tutorial you read teaches you what correct code looks like. A test suite that fails until you
fix it teaches you what a *specific wrong assumption* looks like when it breaks — which is
closer to what the exam, and real debugging, actually ask of you. That's the bet this repo
makes, batch after batch: don't show the pattern, hide it behind a red test and let the failure
message do the teaching.
