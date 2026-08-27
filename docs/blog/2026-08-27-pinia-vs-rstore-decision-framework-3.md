---
title: 'Pinia or rstore: a decision framework, not a feature comparison'
date: '2026-08-27'
tags: [vue, ecosystem]
summary: >-
  "Which is better" is the wrong question — the useful one is what kind of state you're actually
  holding. A per-feature checklist for choosing Pinia, rstore, or a boundary where both coexist
  in the same app.
readTime: 6
---

# Pinia or rstore: a decision framework, not a feature comparison

"Which one is better, Pinia or rstore?" is the wrong question, and answering it head-on is how you end up with a store that's half state container, half ad hoc data layer, doing neither job cleanly. The useful question is narrower: for *this specific piece of state*, where does it come from, and what does it need to survive contact with a network? Answer that per feature and the choice mostly makes itself. This is a working checklist for making that call, not a rehash of what either tool does — see the rstore introduction for that groundwork if you haven't read it yet.

## Start with three questions about the state itself

Before reaching for either library, ask what kind of state you're actually holding:

**Does it originate from your server, or does it originate from the user's current interaction with the UI?** A cart total derived from line items the user just clicked "add" on is UI state. A list of products fetched from an API is server state. That distinction alone resolves most cases before you even look at features.

**Is it shared reactively across components that don't have a parent-child relationship?** Both tools solve this — it's not a differentiator on its own — but it rules out reaching for either when a `ref` in a composable would do.

**Does it need to survive a page refresh, work offline, or update optimistically before the server confirms?** This is where the two tools genuinely diverge, and it's the question worth spending the most time on.

## The checklist

**Reach for Pinia when:**
- The state is derived from user interaction, not fetched from a server — form drafts, active filters, modal visibility, wizard step, selected tab.
- You want direct control over the shape of state and how it mutates — Pinia doesn't impose a schema or a fetch lifecycle, which is exactly the point when there isn't one to impose.
- The state genuinely has no "server truth" to reconcile against, so there's nothing to normalize or cache.
- You need the smallest possible footprint and the most Vue developers on the team already know the API cold.

**Reach for rstore when:**
- The state is a local copy of something a server owns — anything you'd otherwise write a `fetch` + `loading` ref + manual cache-busting for.
- The same data gets queried from more than one place in the app, and you want a mutation in one place to be visible everywhere without you writing the invalidation logic yourself.
- You want optimistic updates, offline reads, or live subscriptions, and you don't want to hand-build all three per feature.
- You're already on Nuxt and want the collection layer generated from a Drizzle schema instead of hand-written per table.

## The gray zone, and how to actually break the tie

Some state sits right on the boundary — a shopping cart is the classic one. The cart's *contents* are arguably server state (they'll eventually sync to an order), but the cart's *open/closed* UI state and the running subtotal shown while the user is still adding items are clearly local. The tie-break in cases like this isn't a rule, it's a bias: default to Pinia for anything that's cheap to get wrong and easy to change your mind about later, and default to rstore for anything where getting the caching or sync logic wrong means a real, hard-to-debug data-consistency bug in production. Under-committing to rstore for genuinely simple fetches also has a cost worth naming honestly: rstore is pre-1.0, and adopting a moving-API dependency for a feature that a five-line `fetch` in a composable would have handled is its own kind of risk.

Team familiarity is a legitimate tiebreaker too, not a cop-out. Pinia is the Vue-recommended, widely taught store — every Vue developer on a team already has muscle memory for `defineStore`, `state`, `getters`, and `actions`. rstore's collection/hook model is a different mental model to onboard onto, worth the cost only when the caching problem it solves is one your team is already solving badly by hand.

A second gray-zone example worth naming: search results with client-side sort and filter controls. The results themselves are server state — a clear rstore fit — but the sort order and active filter chips the user is toggling are local UI state layered on top of that data, not a new copy of it. The mistake to avoid here is letting either tool creep into the other's territory: storing the sorted-and-filtered *array* in Pinia (now you own a second, staler copy of server data) or storing the sort direction inside an rstore collection (now a UI-only toggle is going through a fetch-hook lifecycle it doesn't need).

You also don't have to pick a stance for the whole app at once. Nothing about introducing rstore requires migrating every existing Pinia store on day one — the two coexist fine, and the lowest-risk way to evaluate rstore is to pick one collection that's currently a hand-rolled `fetch` + `loading` ref inside a Pinia store, port just that piece over, and leave everything else as-is. If the caching and invalidation logic it removes is worth the new dependency, that becomes obvious from one feature rather than a big-bang rewrite.

## The pattern that avoids picking a "winner" at all

In practice, most apps that use both don't have them fight over the same state — they draw a boundary. rstore owns the collection of data that mirrors the server; a thin Pinia store, if you need one at all, owns UI state that's *derived from* that data plus purely local interaction state:

```ts
// stores/cartUi.ts — Pinia: local-only UI state
export const useCartUiStore = defineStore('cartUi', () => {
  const isOpen = ref(false)
  const selectedItemId = ref<string | null>(null)
  return { isOpen, selectedItemId }
})
```

```vue
<!-- CartDrawer.vue — rstore: the actual cart data -->
<script setup lang="ts">
const store = useStore()
const { data: cartItems } = await store.cartItems.query(q => q.many())
const cartUi = useCartUiStore()
</script>
```

Neither store reaches into the other's job. The Pinia store never holds a copy of server data, and the rstore collection never holds `isOpen`. That boundary is the actual answer to "Pinia or rstore" for most real apps: not a choice between the two, but a decision, made feature by feature, about which kind of state you're looking at.

## Sources

- [rstore](https://rstore.dev/)
- [Pinia](https://pinia.vuejs.org/)
