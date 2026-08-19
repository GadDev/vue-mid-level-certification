## Context

This repo already has one precedent for "agent that surveys the repo, proposes
candidates, and drafts on confirmation": `exercise-gap-filler.md` (from
`add-exercise-gap-agent`), which reuses `/new-exercise.md`'s scaffolding contract by
reading it rather than duplicating it. This design follows the same shape for blog
posts, reusing `vue-ecosystem-blog`'s `docs-blog` spec as the contract for filename,
frontmatter, and content scope instead of a second, drift-prone copy.

Unlike the exercise agent, this one has no equivalent slash command to lean on for
the "how to write a post" mechanics — `vue-ecosystem-blog` defines structure
(filename convention, frontmatter fields, index page via `createContentLoader`,
content-scope boundary) but not an authoring command. The agent's build mode has to
own drafting the post body itself, using the spec only for the structural contract.

## Goals / Non-Goals

**Goals:**
- Turn "what's post-worthy right now" into a repeatable, on-demand survey grounded in
  what's already published under `docs/blog/`, not a guess at what might be missing.
- Keep a human checkpoint between "here are candidate topics" and "a post file got
  written" — a published post is public-facing content, more consequential than a
  scaffolded exercise's internal file.
- Stay strictly inside `docs-blog`'s declared content scope (Vue core/ecosystem
  releases, tooling, AI-tooling-for-Vue) and explicitly exclude this repo's own
  exercise/release news, per `vue-ecosystem-blog`'s proposal.

**Non-Goals:**
- Not implementing `vue-ecosystem-blog` itself (nav entry, index page, VitePress
  wiring) — this agent is a consumer of that capability, built afterward.
- Not fact-checking or fetching live external sources (release notes, changelogs) as
  part of this design — the agent works from what the user supplies in the
  conversation plus repo-local context; sourcing external research is an open
  question below, not a decision made here.
- Not auto-publishing without confirmation, and not maintaining its own separate
  record of "topics already covered" beyond reading `docs/blog/*.md` frontmatter.

## Decisions

**One subagent file, two modes, mode chosen by whether a concrete topic is named** —
identical switch to `exercise-gap-filler.md`. No topic named → analysis mode: list
candidate posts. A topic named (either from prior analysis output or given directly
by the user) → build mode: draft the full post file.
- *Alternative considered*: separate finder/builder agents. Rejected for the same
  reason as the exercise agent — subagents can't invoke each other, so one would end
  up duplicating the other's contract-reading logic.

**Build mode reads `docs-blog`'s spec file, not a hardcoded convention.** The agent's
instructions point at `openspec/changes/vue-ecosystem-blog/specs/docs-blog/spec.md`
(pre-archive) or `openspec/specs/docs-blog/spec.md` (post-archive) for the filename
pattern, frontmatter fields, and scope rules, and follows whichever one is present.
- *Alternative considered*: inline the convention (e.g. hardcode `YYYY-MM-DD-slug.md`
  and the frontmatter field list) directly into the agent file. Rejected — if
  `vue-ecosystem-blog`'s design changes the convention later, a hardcoded copy drifts
  silently, the exact failure mode `review-exercise.md` and `exercise-gap-filler.md`
  both already guard against elsewhere in this repo.

**Duplicate-topic detection reads existing posts' frontmatter, not just filenames.**
Analysis mode lists `docs/blog/*.md`, reads each file's `title`/`tags`/`summary`
frontmatter, and treats a candidate as already-covered if it substantially overlaps
an existing post's topic — not merely if the slug happens to differ.

**Tool access**: `Read, Write, Glob, Grep` — no `Edit` (a new post is always a new
file, never a modification to an existing one) and no `Bash` (drafting markdown needs
no shell access, unlike exercise scaffolding which runs installs/tests/typecheck).
This is a narrower tool set than `exercise-gap-filler.md`'s, reflecting that a blog
post has no build/verify step the way a scaffolded exercise does.

**Post drafts are self-contained prose, not a stub for a human to fill in.** Build
mode writes a complete post (intro, body sections, a closing note) so "confirm the
topic" is the only checkpoint — matching the answered clarifying question that this
agent should draft, not just outline.

## Risks / Trade-offs

- **[Risk]** "Is this topic already covered" is a judgment call based on frontmatter
  summaries, which can be terse or stale → **Mitigation**: analysis mode always shows
  its reasoning (which existing post, if any, a candidate might overlap) so the human
  can override the agent's dedup judgment when confirming a topic.
- **[Risk]** The agent has no live web access designed into this change, so its
  "survey of what's happening in the Vue ecosystem" is bounded by what the user
  supplies or what's already reflected in repo docs → **Mitigation**: documented as
  an explicit Non-Goal and Open Question rather than silently assumed; analysis mode
  states the sources it drew candidates from.
- **[Risk]** Depends on `vue-ecosystem-blog` landing first; if invoked before that,
  build mode has no spec to read → **Mitigation**: agent checks for the spec file at
  start of build mode and stops with a clear message if neither the pre-archive nor
  post-archive path exists, mirroring `exercise-gap-filler.md`'s handling of a
  missing `/new-exercise.md`.
- **[Risk]** A published post that turns out inaccurate or off-scope is more visible
  than a scaffolded exercise mistake → **Mitigation**: the confirmation checkpoint
  stays mandatory (no fully-autonomous mode), per the answered clarifying question.

## Migration Plan

Purely additive — one new file, no existing behavior changes. Rollback is deleting
`.claude/agents/blog-post-filler.md`. Sequencing: land after `vue-ecosystem-blog` is
implemented and archived (or at least merged past proposal), since build mode has
nothing to read otherwise.

## Open Questions

- Whether a future iteration should give this agent live web access (WebFetch/
  WebSearch) to source real-time release/ecosystem news, versus relying on the user
  to supply source material in the prompt — left open, not blocking this proposal's
  first version, which works from whatever context the invocation provides.
- Exact agent filename/description wording — finalized when the file is written in
  tasks.md.
