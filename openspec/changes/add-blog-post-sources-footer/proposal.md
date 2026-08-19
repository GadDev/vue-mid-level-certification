## Why

`add-vue-blog-post-skill` (implemented, archived) gave Brainstorm mode a live `WebSearch` step per
content lane, so a candidate's timeliness is backed by a real URL rather than training-data memory.
That citation currently only surfaces in the Brainstorm shortlist and is discarded once Draft mode
starts — a published post carries no trace of what it was researched against. The maintainer asked
for every drafted post to end with the sources it actually relied on, so a reader (or the maintainer,
re-checking a claim later) can verify a claim against its origin instead of taking the post's word for
it. This was implemented directly in `.claude/skills/vue-blog-post/SKILL.md` and
`references/scope-and-format.md` before `add-vue-blog-post-skill` was archived, which means the
archived change's applied spec (`openspec/specs/vue-blog-post-skill/spec.md`) does not yet describe
this behavior — this change is the spec delta that catches the already-shipped implementation up to
its own spec of record.

## What Changes

- Draft mode's stage 3 (draft) now ends every post with a `## Sources` section — markdown links, one
  per line — seeded from the Mode 1 citation behind the confirmed topic.
- Draft mode's stage 4 (verify code samples) appends any additional URL a verification lookup
  surfaces to that same section, rather than leaving it uncredited.
- The `readTime` word-count exclusion (`docs-blog`'s frontmatter schema requirement) now excludes the
  `## Sources` section's own text in addition to the frontmatter block, so a post's link list doesn't
  inflate its estimated reading time.
- The Draft mode final self-checklist gains a check for the `## Sources` section's presence, with an
  explicit-absence escape hatch for a post that used nothing beyond existing training knowledge.

## Capabilities

### Modified Capabilities

- `vue-blog-post-skill`: Draft mode gains a Sources-footer requirement (ADDED — new requirement,
  since no prior requirement described the drafted post's closing content).
- `docs-blog`: the `readTime` `bodyWordCount` exclusion is widened to cover the `## Sources` section
  (MODIFIED — narrows what counts toward the existing formula, does not change the formula itself).

## Impact

- Modified (already applied to working files, pre-dating this proposal): `.claude/skills/vue-blog-post/SKILL.md`,
  `.claude/skills/vue-blog-post/references/scope-and-format.md`.
- Modified: `openspec/specs/vue-blog-post-skill/spec.md` and `openspec/specs/docs-blog/spec.md`, once
  this change is archived.
- No changes to existing published posts; `docs/blog/2026-08-18-nuxt-eol-migration-checklist.md` (a
  smoke-test artifact, not yet a decided-on real post) already carries a `## Sources` section as a
  worked example of the new format.
