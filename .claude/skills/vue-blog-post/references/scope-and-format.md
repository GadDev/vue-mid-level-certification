# Scope & format contract

Authoritative for filename, frontmatter, and length. `SKILL.md` dispatches modes; this file is
what Draft mode's stage 5 (frontmatter) and stage 6 (self-checklist) read.

## Content scope — the two lanes

Copied from `docs/blog/index.md`; re-read that file if it changes.

- **Vue & ecosystem news** — Vue core releases, and the tools built around it (Vite, Pinia, Vue
  Router, Nuxt, Vitest, VueUse, and similar) — what changed, why it matters, what it means for
  existing code.
- **Generative AI meets Vue** — AI-assisted dev tools, component generators, and agent frameworks
  that target Vue codebases, covered from the angle of "does this actually help you ship Vue, and
  how."

**Excluded, always**: this repo's own exercises, releases, or changesets. That has its own
channel (the changelog / README); it is never a blog topic.

## Filename pattern

```
docs/blog/YYYY-MM-DD-slug.md
```

- `YYYY-MM-DD` is the date the post is drafted, and must equal the frontmatter `date`.
- `slug` is kebab-case, derived from the title, short enough to skim in a URL.
- **Same-day collision**: if a second post is drafted on a date that already has one, append
  `-2`, `-3`, ... to that second slug (`2026-08-18-nuxt-4-devtools-2.md`) rather than picking an
  unrelated slug that hides the collision.

## Frontmatter schema

```yaml
---
title: 'Sentence-case, no trailing period'
date: '2026-08-18' # must match the filename date
tags: [vue, nuxt, devtools] # reuse existing tags — see "Tag vocabulary" below
summary: >-
  One to two sentences, written for the index page. States the concrete claim, not just the
  topic.
readTime: 6
---
```

All five fields are required. `pnpm docs:build` fails if any are missing from a post published
under this contract (see the Pre-existing posts exemption below).

### `readTime` formula

```
readTime = max(1, ceil(bodyWordCount / 200))
```

- `bodyWordCount` excludes the frontmatter block — count only the rendered Markdown body.
- Compute it **after** the draft is finished, from the actual text, not a target estimate. Do
  not reuse the 1000-1500 word target band as a shortcut — a specific post's word count is
  usually not a round number.
- To get an exact count rather than eyeballing it: write the drafted body to a scratch file and
  run `wc -w` on it, or count words in the final markdown directly before computing the ceiling.

### Tag vocabulary

Reuse tags already present across `docs/blog/*.md` frontmatter instead of inventing near-duplicates
(`ecosystem` vs `vue-ecosystem`, `ai` vs `genai`). Read the existing tag set as part of stage 1
(scouting/dedupe) and prefer an existing tag whenever the topic fits one.

### Pre-existing posts are exempt

Posts published before this `readTime` requirement took effect (currently:
`2026-08-18-how-this-repo-teaches-vue.md`) are not required to gain the field retroactively. Do
not edit an existing post to backfill it as a side effect of an unrelated task.

## Voice, tone, and length

- **Voice**: senior Vue engineer talking to peers, not a press release and not a tutorial for
  beginners.
- **Tone**: enthusiastic, trend-forward, opinionated — take a position on why something matters,
  don't just restate a changelog.
- **Length**: 1000-1500 words of body content. If a confirmed topic genuinely warrants going
  outside that range, say so explicitly in the self-checklist rather than silently drafting short
  or long.
- **Staleness caveat**: specific version numbers, feature names, or behavior claims about recent
  releases may postdate training data. State those claims as best-current-understanding rather
  than verified fact unless the user has supplied a primary source (changelog, release notes) in
  the conversation. Prefer "as of the last release I have visibility into" phrasing over asserting
  a specific detail with full confidence when it can't be checked against a source.

## Final self-checklist (Draft mode, stage 6)

Before saving the file, confirm all of the following — fix and re-check rather than saving with a
known failure:

- [ ] Filename matches `docs/blog/YYYY-MM-DD-slug.md` and its date equals frontmatter `date`.
- [ ] Frontmatter has all five fields: `title`, `date`, `tags`, `summary`, `readTime`.
- [ ] `tags` reuses existing vocabulary where a fitting tag already exists.
- [ ] Body word count is 1000-1500, or the deviation is explicitly justified.
- [ ] `readTime` was computed from that same final word count via the formula above — not
      estimated before drafting.
- [ ] No claim substantially duplicates an existing post (re-check against the Mode 1 dedupe
      pass).
- [ ] Any claim about a specific recent version/feature carries the staleness caveat unless a
      source was given in-conversation.
- [ ] Topic stays within the two declared content lanes; nothing about this repo's own
      exercises/releases.
