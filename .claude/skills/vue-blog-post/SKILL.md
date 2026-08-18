---
name: vue-blog-post
description: >-
  Brainstorm or draft posts for this repo's docs/blog on Vue core/ecosystem news (Vite, Pinia,
  Vue Router, Nuxt, Vitest, VueUse, etc.) or generative-AI dev tooling for Vue. Use when asked to
  pitch blog topics, write a blog post, or create/update a file under docs/blog/. Produces a
  complete, ready-to-publish post — senior-Vue-engineer voice, trend-forward tone, 1000-1500
  words (~5-7 min read) — matching this repo's frontmatter contract (title, date, tags, summary,
  readTime). Full scope rules and the frontmatter template are in references/scope-and-format.md.
---

# Vue & AI-tooling blog post

Two modes. Which one runs depends on whether the request names a topic.

## Mode 1 — Brainstorm (no topic named)

Triggered by requests like "what should we blog about" or "pitch some post ideas" — nothing
naming a specific topic.

1. Read `docs/blog/index.md` for the two content lanes and the exclusion (this repo's own
   exercise/release news has its own channel — never pitch that here).
2. Read the frontmatter (`title`, `tags`, `summary`) of every file in `docs/blog/*.md` to know
   what's already covered.
3. Propose 3-5 candidates as a numbered list: working title, which lane it's in, why it's timely
   right now, and one sentence of rough scope. Flag anything that overlaps an existing post by
   name instead of silently dropping it.
4. **Do not write any file in this mode.** Stop here and wait for an explicit confirmation — the
   user naming a specific candidate by number or title, or stating a topic directly. A reaction
   that merely comments on the shortlist ("the Nuxt one sounds interesting, what do you think?")
   is not a confirmation — ask which candidate to draft rather than guessing.

## Mode 2 — Draft (topic confirmed)

Triggered once a topic is explicitly confirmed — from your own Mode 1 shortlist or given
directly. Run as six tracked stages; treat each as a checkpoint the user can redirect after,
not one opaque "write it" step.

1. **Scout & dedupe.** Re-run Mode 1 step 2 if you haven't already this conversation — read every
   existing post's frontmatter and confirm the confirmed topic doesn't substantially duplicate
   one. If it does, say so and stop rather than drafting anyway.
2. **Outline.** Sketch the section structure (introduction hook, 2-4 body sections, closing note)
   and which claims need a concrete code sample (a config snippet, a diff, a before/after) before
   writing full prose.
3. **Draft.** Write the complete post from the outline — full prose, not a stub. Read
   `references/scope-and-format.md` first for the voice/tone/length contract (senior-Vue-engineer
   voice, trend-forward, 1000-1500 words) and the staleness caveat for claims about recent
   releases.
4. **Verify code samples.** Check every snippet against what you actually know of the relevant
   API/config shape — flag (in the caveat style from the reference file) any sample describing
   behavior that postdates what you can verify, rather than presenting it as confirmed.
5. **Frontmatter + `readTime`.** Read `references/scope-and-format.md` for the filename pattern
   and full frontmatter schema. Compute `readTime` from the *finished* draft's actual body word
   count via that file's formula — never estimate it before the body is done.
6. **Final self-checklist.** Run every item in `references/scope-and-format.md`'s checklist
   before saving. Fix anything that fails rather than saving with a known gap, then write to
   `docs/blog/YYYY-MM-DD-slug.md`.

## Worked example (opening of a draft)

```md
---
title: 'Nuxt 4 and the Vue devtools rewrite: what actually changes in your workflow'
date: '2026-08-18'
tags: [vue, nuxt, devtools, ecosystem]
summary: >-
  Nuxt 4's file-structure defaults and the new devtools inspector aren't just cosmetic — they
  change how you debug a stale composable in a running app. Here's what to expect on upgrade.
readTime: 6
---

# Nuxt 4 and the Vue devtools rewrite: what actually changes in your workflow

Nuxt 4 shipped with a default `app/` directory and most people's first reaction was "why did my
imports break." That's the boring part. The interesting part is buried two releases deep in the
Vue devtools: the inspector now traces a `computed`'s dependency graph live, which turns "why did
this re-render" from a print-statement hunt into a five-second look at a panel...
```

That's the register to hit: a concrete, opinionated hook in the first two sentences, a real
technical detail by the third, forward-leaning about why it matters — not a press-release
recap of a changelog.
