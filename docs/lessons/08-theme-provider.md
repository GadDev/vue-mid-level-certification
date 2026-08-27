# Lesson 08 — Passing data down without props

> Prep for Exercise 08. Concepts and examples only — this page does not
> discuss the exercise's edge cases or its solution.

## The problem

Props pass data from a parent to its direct children — clean and explicit,
as long as the component that has the data and the component that needs it
are close together. They stop being clean the moment the data is needed
three or four levels deep: every intermediate component has to accept a prop
it never uses itself, just to forward it further down. That's **prop
drilling**, and it couples components that have nothing to do with each
other except standing in the same ancestry chain.

![Lesson 8 — Passing data down without props](../assets/lesson_8.png)

## The main idea

Vue's `provide`/`inject` lets an ancestor make a value available to _any_
descendant, at any depth, without every component in between having to know
it exists:

```vue
<!-- Ancestor.vue -->
<script setup lang="ts">
import { provide, ref } from "vue";

const language = ref<"en" | "fr">("en");
provide("language", language);
</script>

<template>
  <Middle />
</template>
```

```vue
<!-- Middle.vue — never mentions 'language' at all -->
<template>
  <DeepChild />
</template>
```

```vue
<!-- DeepChild.vue -->
<script setup lang="ts">
import { inject } from "vue";
import type { Ref } from "vue";

const language = inject<Ref<"en" | "fr">>("language");
</script>

<template>
  <p>{{ language?.value }}</p>
</template>
```

`Middle` never imports, declares, or passes along `language` — it's invisible
to every component between the provider and the consumer. But this version
has a real gap: `inject<Ref<'en' | 'fr'>>('language')` is the _caller_
asserting the type, not `provide` guaranteeing it. Nothing stops a typo —
`inject('langauge')` — from compiling cleanly and returning `undefined` at
runtime, because a plain string key carries no type information at all;
without the explicit type argument, `inject('language')` would infer as
`unknown`, and even with it, TypeScript has no way to check the string
against what was actually provided.

A typed `InjectionKey` closes that gap by giving the key itself a type,
shared between the provide and inject sides:

```ts
// keys.ts
import type { InjectionKey, Ref } from "vue";

export const languageKey: InjectionKey<Ref<"en" | "fr">> = Symbol("language");
```

```vue
<!-- Ancestor.vue -->
<script setup lang="ts">
import { provide, ref } from "vue";
import { languageKey } from "./keys";

const language = ref<"en" | "fr">("en");
provide(languageKey, language);
</script>
```

```vue
<!-- DeepChild.vue -->
<script setup lang="ts">
import { inject } from "vue";
import { languageKey } from "./keys";

const language = inject(languageKey);
</script>

<template>
  <p>{{ language?.value }}</p>
</template>
```

Now `inject(languageKey)` has no need for a manual type argument — TypeScript
already knows, from the key's own declared type, that the result is
`Ref<'en' | 'fr'> | undefined`. A typo can't compile, because there's no
second string to typo; `languageKey` is a single shared symbol both sides
import from the same module.

### App-level state via a plugin

`provide`/`inject` as shown still needs one component to call `provide` —
usually the app's root component. For state that belongs to the _whole app_,
not to any one component's local concerns, a **Vue plugin** provides it once,
outside any component, via `app.provide` in its `install()`:

```ts
// languagePlugin.ts
import { ref } from "vue";
import type { App, Plugin } from "vue";
import { languageKey } from "./keys";

export function createLanguagePlugin(initial: "en" | "fr" = "en"): Plugin {
  return {
    install(app: App) {
      app.provide(languageKey, ref(initial));
    },
  };
}
```

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createLanguagePlugin } from "./languagePlugin";

createApp(App).use(createLanguagePlugin("fr")).mount("#app");
```

`app.provide` makes the value reachable from `inject()` anywhere in that
app's component tree — no root component needs a `provide()` call of its
own, and the plugin owns exactly when and how the state is created. Two
separate `createApp()` calls, each with their own `.use(createLanguagePlugin())`,
get two fully independent instances of the state — the plugin's `install()`
runs once per app, not once globally.

## Reference

→ `docs/PATTERNS.md` § "provide/inject with a typed key"
→ `docs/PATTERNS.md` § "App-level state in a plugin"
→ Earlier lessons: none — Lesson 08 owns `provide`/`inject`, typed
`InjectionKey`, and app-level state via a plugin

## Sources

- Vue.js official docs — [Provide / Inject](https://vuejs.org/guide/components/provide-inject.html)
- Vue.js official docs — [Typing Provide / Inject](https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject)
- Vue.js official docs — [Plugins](https://vuejs.org/guide/reusability/plugins.html)
- Vue.js official docs — [Application API: `app.provide`](https://vuejs.org/api/application.html#app-provide)
- Michael Thiessen — [Provide/Inject in Vue 3](https://michaelnthiessen.com/provide-inject) (independent Vue educator on typed injection keys and avoiding prop drilling)
- Anthony Fu — [VueUse `createInjectionState`](https://vueuse.org/shared/createInjectionState/) (a VueUse composable that wraps the exact typed-key `provide`/`inject` pattern taught here)

## Now do Exercise 08
