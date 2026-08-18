## Context

`docs-blog` (implemented, archived) already defines the blog's structure: filename pattern
(`docs/blog/YYYY-MM-DD-slug.md`), a required frontmatter schema (`title`, `date`, `tags`, `summary`),
the two content lanes (Vue core/ecosystem news; generative AI meets Vue), and an automatic
content-loader-driven index. `add-blog-post-agent` proposed filling the remaining gap — "who decides
what to write about, and drafts it" — with a subagent. That proposal is unimplemented. During
authoring, a Skill (`.claude/skills/vue-blog-post/SKILL.md`) was built directly with the maintainer
instead, because the gap is really "apply a fixed writing contract" (persona, tone, length, frontmatter
shape) plus a repeatable two-mode workflow — the same shape as the `vue-best-practices` Skill already
in this environment, not the shape of `exercise-gap-filler.md`'s scaffold-and-verify agent.

A further brainstorm session considered three shapes for the drafting workflow itself: a multi-gate
newsroom pipeline (rejected — this repo has one author, so approval gates that exist to coordinate
multiple humans buy nothing), a multi-agent `Workflow` with parallel stages (rejected — one post at a
time, no cross-item synchronization need that would justify orchestration overhead), and a lean
single-pass Skill with explicit sub-stages tracked as a visible task list (chosen — matches solo
authorship, keeps drafting redirectable mid-post without re-running everything).

## Goals / Non-Goals

**Goals:**
- Replace `add-blog-post-agent`'s subagent design with the already-authored Skill, and give Draft
  mode an explicit, visible six-stage breakdown instead of one undifferentiated "write it" step.
- Keep `docs-blog` as the single source of truth for filename/scope/frontmatter; the Skill's bundled
  `references/scope-and-format.md` restates the frontmatter contract for quick lookup but the
  authoritative field list lives in the `docs-blog` spec, which this change also extends with `readTime`.
- Preserve the confirmation checkpoint between Brainstorm and Draft mode: naming or confirming a topic
  is what starts drafting; Brainstorm mode never writes a file.

**Non-Goals:**
- Not adding live web access (WebSearch/WebFetch) for ecosystem-trend sourcing — same open question
  `add-blog-post-agent`'s design left open; still deferred, not decided here.
- Not building a multi-agent `Workflow` or a newsroom-style multi-person review gate — explicitly
  rejected per the Context section above.
- Not retrofitting `readTime` onto the existing inaugural post; the field applies going forward.

## Decisions

**Skill, not subagent.** `.claude/skills/vue-blog-post/SKILL.md` is triggered either automatically (its
`description` names the trigger conditions per this environment's Skill-authoring convention: "when
asked to pitch blog topics, write a blog post, or create/update a file under docs/blog/") or explicitly
via `/vue-blog-post`. This replaces `add-blog-post-agent`'s two-mode subagent with an equivalent
two-mode Skill, since a Skill's own description-triggered loading already gives the "does this apply to
the current task" gating a subagent would otherwise need to be invoked for.
- *Alternative considered*: keep the subagent for context isolation (a full ecosystem survey could be
  large). Rejected — Brainstorm mode's dedupe step only reads local frontmatter (`docs/blog/*.md`), not
  external sources, so there is no large tool-output volume to isolate; if live web research is added
  later (per the deferred Non-Goal), revisit then.

**Draft mode is six explicit stages, tracked as a task list, not one step.** Topic scouting/dedupe →
outline → draft → code-sample verification → frontmatter + `readTime` computation → final
self-checklist. Each stage produces a checkable artifact (a confirmed topic; an outline; prose; verified
snippets; complete frontmatter; a pass/fail checklist) so a maintainer can redirect after any stage
instead of only after the whole post is written.
- *Alternative considered*: collapse straight to "write a complete post" (what `add-blog-post-agent`'s
  build mode did). Rejected per the brainstorm — a single opaque step hides exactly the redirect points
  (bad outline, wrong code sample, wrong tone) that are cheapest to fix early.

**`readTime` is computed, not authored.** Formula: `ceil(wordCount / 200)`, minimum 1, computed from the
finished draft's body word count (frontmatter excluded) as the last content stage before the file is
written — never estimated before drafting, since the actual word count isn't known yet at that point.
- *Alternative considered*: a fixed per-post estimate stated in the Skill's own length target
  (1000-1500 words → "5-7 min"). Rejected as the frontmatter value — a range is fine for planning, but
  a single post's actual `readTime` should reflect what was actually written, not the target band.

**`add-blog-post-agent` is archived unimplemented, not deleted silently.** It stays in
`openspec/changes/archive/` (per this repo's existing archival convention, e.g.
`archive/2026-08-18-vue-ecosystem-blog/`) so the superseded design remains readable, with this
change's proposal.md's "Why" section as the pointer explaining the supersession.
- *Alternative considered*: delete the directory outright. Rejected — the design.md's own Context
  section (subagent vs. slash-command precedent) is worth keeping discoverable even though the design
  wasn't built.

## Risks / Trade-offs

- **[Risk]** Splitting Draft mode into six stages adds ceremony for what is still, in absolute terms, a
  short writing task → **Mitigation**: stages are tracked in Claude Code's existing task list, not a
  new mechanism; a maintainer who wants the single-pass behavior can still ask for "draft it end to end"
  and the Skill collapses the visible stages into one flow, per its own instructions.
- **[Risk]** `readTime`'s fixed 200 wpm constant may not match this blog's actual audience reading
  speed → **Mitigation**: documented as a stated formula in the spec and the Skill's reference file, so
  it's a one-line change in one place if it turns out wrong, not a scattered assumption.
- **[Risk]** Archiving `add-blog-post-agent` unimplemented could read as "this work was wasted" →
  **Mitigation**: proposal.md's Why section states explicitly why the subagent shape was replaced, so
  the archive entry documents a decision, not an abandonment.

## Migration Plan

Purely additive to the Skill (already authored) plus one new frontmatter field on `docs-blog`. No
runtime migration: the existing inaugural post keeps its current frontmatter and is not required to gain
`readTime` retroactively — the `docs-blog` build-integrity requirement only needs to validate the field
on posts that declare it going forward, per the specs delta. Rollback is deleting
`.claude/skills/vue-blog-post/` and reverting the `docs-blog` spec delta; no other system depends on
either.

## Open Questions

- Whether to backfill `readTime` on the existing inaugural post for consistency — left to the
  maintainer's discretion, not required by this change.
- Whether live web access for ecosystem-trend sourcing gets added to Brainstorm mode in a future
  iteration — same open question `add-blog-post-agent` left unresolved; still open here.
