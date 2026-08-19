---
title: "Vue's Vapor Mode: what changes once it's opt-in"
date: '2026-08-18'
tags: [vue, vapor, performance, compiler]
summary: >-
  Vapor Mode skips the virtual DOM entirely by compiling templates straight to direct DOM
  updates — and it's landing as an opt-in, component-by-component adoption path, not a rewrite.
readTime: 7
---

# Vue's Vapor Mode: what changes once it's opt-in

Every Vue component you've written compiles down to a render function that produces a virtual
DOM tree, and every reactive update means diffing that tree against the last one before touching
the real DOM. It's fast, and it's also work that a sufficiently smart compiler shouldn't have to
do at all — if the compiler already knows which expression touches which DOM node, why build a
tree just to compare it against itself? That's the bet behind Vapor Mode: a second compilation
strategy for `<script setup>` components that skips the virtual DOM entirely and emits code that
patches real DOM nodes directly, keyed to the exact reactive dependency that changed.

## What Vapor actually compiles to

The mental model that clicked for me: today's compiler turns your template into a `render()`
function returning VNodes, and the runtime's job is reconciling those VNodes against the DOM.
Vapor's compiler instead walks the template once, generates real DOM nodes up front, and wires
each dynamic binding straight to the `effect` that updates it — no VNode, no diff, no
reconciliation pass. A `{{ count }}` interpolation doesn't become "re-render, then patch the text
node if it changed"; it becomes a tiny reactive effect that writes `node.textContent` directly
when `count` changes. The reactivity system underneath — `ref`, `computed`, `watch` — is
unchanged. What's gone is the intermediate representation between "state changed" and "DOM
updated."

That's a meaningfully different performance profile for two kinds of apps: components with large,
mostly-static templates where the VDOM diff was pure overhead, and components that re-render
often on small state changes (a live ticker, a form validating on every keystroke) where skipping
reconciliation removes a whole tree-walk per update, not just the DOM write.

## Opt-in, not a rewrite

The part worth taking seriously before you get excited: Vapor is being positioned as opt-in per
component, not a flag you flip for an entire app. As of the last preview builds I have visibility
into, the intended shape is something close to:

```vue
<script setup vapor>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

— the same Composition API code you already write, with the compiler told (via the `vapor`
attribute, or an equivalent build-level opt-in — the exact surface is still moving) to emit
Vapor output for this component instead of VDOM output. That's a deliberate design choice: it lets
a large existing app adopt Vapor component-by-component, starting with the ones that actually
benefit, rather than forcing an all-or-nothing migration the way a full rewrite would.

The harder problem is interop — a Vapor component still needs to render inside a VDOM-based
parent, receive props from it, and emit events back up, and a VDOM component needs to be able to
mount a Vapor child without either side knowing the other's internal representation. The core
team has talked about this as an explicit interop layer rather than something that falls out for
free, precisely because "components with two different internal update mechanisms sit in the
same tree" is not a problem Vue has had to solve before. If you're evaluating Vapor for an
existing app rather than a greenfield one, this is the part to prototype first, not the raw
render-speed number.

## What doesn't carry over cleanly

Anything in the ecosystem that reaches past the public component API and assumes a VNode tree
underneath is the real risk surface — a testing utility that inspects rendered VNodes, a
devtools integration that walks the render tree, a component library that patches instance
internals for a feature the public API doesn't expose. None of that is Vue-core's problem to fix
directly, but it's exactly the kind of breakage that doesn't show up until someone tries it, and
it's worth checking before you pick a component to convert. If a component only uses props,
slots, emits, and the Composition API, it's a low-risk conversion candidate. If it — or something
that touches it — pokes at internals, test in isolation first.

The other caveat, stated plainly: I'm describing the shape of a feature that's still moving, from
the last preview builds I've seen. Treat the `vapor` attribute's exact syntax and the interop
story's finished form as "this is the direction, not a locked API" — check the current release
notes before you write code against either.

## Why it's worth tracking now

The interesting thing about Vapor isn't "Vue got faster" in the abstract — plenty of frameworks
have made that claim without changing how you write components. It's that the authoring model
stays identical. You still write `<script setup>`, you still reach for `ref` and `computed`, you
still think in terms of reactive dependencies rather than manual DOM manipulation. The compiler
is doing categorically different work underneath, and from where you sit as the person writing
the component, that work is invisible until you look at a profiler. That's a rare shape for a
performance win to take — usually "faster" comes with "and now write it differently." If Vapor
ships with the opt-in, component-by-component adoption path it's aiming for, the practical
question for most teams won't be "should we rewrite for Vapor" — it'll be "which handful of
components in our biggest render-cost offenders are simple enough to flip the switch on first."
That's a much smaller decision, and worth having an answer to before the feature lands stable.

## How this compares to Svelte and Solid

If this sounds familiar, it's because compile-time reactivity without a virtual DOM is exactly
what Svelte and SolidJS have been doing for years — Svelte's compiler generates direct DOM
update code from the start, and Solid compiles JSX into fine-grained reactive bindings with no
VDOM step at all. What's notable about Vue's approach isn't that it's first; it's that it's
arriving as a second compilation target inside a framework whose entire existing ecosystem —
component libraries, testing tools, devtools, thousands of production apps — was built assuming
a VNode-based runtime. Svelte and Solid got to design their reactivity model and their compiler
together, from a blank slate. Vue is retrofitting the "no VNode" performance story onto an
authoring model (Composition API, SFCs, the reactivity system) that already has years of
ecosystem investment behind it. That's a harder problem than "generate fast DOM code" — it's
"generate fast DOM code that a `<script setup>` component written in 2023 can opt into without
being rewritten," and the interop layer is where that harder problem actually lives.

## What to do with this today

Nothing, in production, yet — and that's fine. The useful move right now is identifying
candidates, not converting anything. Profile your app, find the two or three components that
spend the most time in reconciliation relative to how simple they are (a big list row, a
frequently-updating dashboard tile), and check whether they lean on props/slots/emits/Composition
API only, or reach into something ecosystem-specific that might not have caught up to Vapor's
interop story yet. That list is what you'll reach for the moment Vapor is stable enough to flip
on for real, and building it now costs you an afternoon of profiling instead of a scramble later.
