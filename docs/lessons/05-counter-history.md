# Lesson 05 — Your first `useX()` composable

> Prep for Exercise 05. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

A component's `<script setup>` is a fine place for state and logic that only
that one component needs. It stops being a fine place the moment two
components need the _same_ stateful behavior — a wizard's step tracker, a
countdown, a toggle with rules about when it's allowed to flip. Copy the
logic into both components and you now have two places that can drift out of
sync. Vue's answer is a **composable**: a plain function, conventionally
named `useSomething`, that packages reactive state and the logic around it
so it can be reused. The part that isn't obvious the first time is _how_ to
package that state so each caller gets its own independent copy.

![Lesson 05 — Your first `useX()` composable](../assets/lesson_5.png)

## The main idea

The tempting shortcut is to declare the state once, at module scope, outside
any function:

```ts
// useStepper.ts — DOES NOT WORK for multiple independent steppers
import { ref, computed } from "vue";

const step = ref(0);
const max = 3;

export function useStepper() {
  const canGoNext = computed(() => step.value < max);
  const canGoBack = computed(() => step.value > 0);

  function next() {
    if (canGoNext.value) step.value++;
  }
  function back() {
    if (canGoBack.value) step.value--;
  }

  return { step: computed(() => step.value), canGoNext, canGoBack, next, back };
}
```

This runs without error, and a single wizard using it works fine. The bug
only appears with a second one: `useStepper()` called from a second
component does not get its own stepper — `step` was declared once, at
module load time, so both wizards read and write the exact same `ref`.
Advance one wizard and the other jumps forward too, because there was never
more than one `step` to begin with. Module-level `const` runs once, the
first time the module is imported, no matter how many times the exported
function is later called.

The fix is to move every piece of the state _inside_ the function body, so
each call creates a fresh copy:

```ts
// useStepper.ts
import { ref, computed } from "vue";

export function useStepper(max = 3) {
  const step = ref(0);

  const canGoNext = computed(() => step.value < max);
  const canGoBack = computed(() => step.value > 0);

  function next() {
    if (canGoNext.value) step.value++;
  }
  function back() {
    if (canGoBack.value) step.value--;
  }

  return {
    step: computed(() => step.value),
    canGoNext,
    canGoBack,
    next,
    back,
  };
}
```

Now `useStepper()` is a **factory**: every call runs the function body from
scratch, so `step` is a brand-new `ref` each time, closed over by that
particular call's `next`/`back`/computeds and invisible to any other call.
Two components calling `useStepper()` get two independent steppers that
share only the code, never the data.

Three details in the return value are deliberate:

- **`step` is exposed as a read-only `ComputedRef`, not the raw `ref`.**
  Returning `step` itself would let any caller write `stepper.step.value = 99`
  directly, bypassing `next`/`back` and the bounds they enforce entirely. A
  `computed` wrapping the ref exposes the current value for reading but has
  no public setter — the only way to change it is through the actions the
  composable itself provides.
- **`canGoNext`/`canGoBack` are computed guards, not booleans checked
  ad hoc inside `next`/`back` alone.** Exposing them lets a template disable
  a "Next" button declaratively (`:disabled="!canGoNext"`) using the exact
  same rule the action itself enforces, instead of the template and the
  action independently re-deriving "are we at the max" and risking the two
  falling out of sync.
- **Nothing here touches the DOM or lifecycle hooks.** `useStepper` is a
  plain function of refs and computeds — which means it can be tested by
  calling it directly, with no component to mount:

```ts
import { describe, expect, it } from "vitest";
import { useStepper } from "./useStepper";

describe("useStepper", () => {
  it("does not advance past max", () => {
    const stepper = useStepper(2);
    stepper.next();
    stepper.next();
    stepper.next();
    expect(stepper.step.value).toBe(2);
    expect(stepper.canGoNext.value).toBe(false);
  });

  it("gives independent state to each call", () => {
    const a = useStepper();
    const b = useStepper();
    a.next();
    expect(a.step.value).toBe(1);
    expect(b.step.value).toBe(0);
  });
});
```

No `mount()`, no wrapper, no DOM — just calling the function and asserting
on the values it returns. That's the payoff of keeping all the logic inside
the composable rather than spread across the component that happens to use
it: the logic and the rendering can be tested separately.

## Reference

→ `docs/PATTERNS.md` § "Composable Functions"
→ Earlier lessons: none — Lesson 05 owns composable factories

## Sources

- Vue.js official docs — [Reusability: Composables](https://vuejs.org/guide/reusability/composables.html)
- Vue.js official docs — [Composables: state encapsulation and reuse](https://vuejs.org/guide/reusability/composables.html#state-encapsulation-and-reuse)
- Vue.js official docs — [`computed()` for read-only derived state](https://vuejs.org/api/reactivity-core.html#computed)
- VueUse docs — [Guide: how VueUse composables are structured](https://vueuse.org/guide/) (a large real-world library of `useX()` factories built on this exact pattern)
- Anthony Fu — [Reinventing Vue.js Reactivity in Vue 2.7/3](https://antfu.me/posts/reinventing-vue-reactivity-in-vueuse) (VueUse author on designing composables as independent, testable factories)

## Now do Exercise 05

<a href="https://github.com/GadDev/vue-mid-level-certification/tree/main/packages/05-counter-history" target="_blank">Open exercise on GitHub</a>

<MarkComplete id="05" />
