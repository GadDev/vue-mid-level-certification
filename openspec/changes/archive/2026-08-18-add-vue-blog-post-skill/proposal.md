## Why

`add-blog-post-agent` (still unimplemented, no code merged) proposed a `.claude/agents/blog-post-filler.md`
subagent to survey topics and draft posts. Since writing that proposal, a `.claude/skills/vue-blog-post/`
Skill was authored instead, and its persona/tone/length were decided directly with the maintainer. A
subagent and a Skill solve overlapping problems here, and for a single-author blog with no multi-person
editorial handoffs, the agent's isolated-context, tool-restricted design buys nothing the Skill doesn't
already give more cheaply: Claude auto-loads a Skill by description match (no explicit invocation
needed) or via `/vue-blog-post`, and its instructions live in one file the maintainer edits directly
instead of a separately-triggered subagent process. This proposal supersedes `add-blog-post-agent` —
that change should be archived as superseded rather than implemented — and formalizes the Skill-based
design plus the explicit six-stage task breakdown for drafting a single post, decided during
brainstorming, so the process reads as a repeatable pipeline instead of one undifferentiated "write it"
step.

## What Changes

- Retire the `blog-post-agent` capability's subagent-shaped requirements. No `.claude/agents/blog-post-filler.md`
  will be built; `add-blog-post-agent` is superseded and should be archived without implementation.
- Add a new `vue-blog-post-skill` capability describing `.claude/skills/vue-blog-post/SKILL.md`
  (already authored) and its bundled `references/scope-and-format.md` (already authored): two modes
  (Brainstorm — survey `docs-blog`'s two content lanes, research current trends per lane via live
  `WebSearch`, and dedupe against existing posts, write no files; Draft — produce a complete post),
  with Draft mode decomposed into six explicit sub-stages (topic scouting/dedupe, outline, draft,
  code-sample verification, frontmatter + `readTime` computation, final self-checklist) tracked as
  a visible task list rather than one opaque step.
- Modify the `docs-blog` capability: add `readTime` (an integer, minutes) as a new frontmatter field,
  computed from draft word count at a documented formula, alongside the existing `title`/`date`/`tags`/`summary`
  fields.
- No changes to VitePress wiring, the blog index page, or existing published posts — the existing
  post (`docs/blog/2026-08-18-how-this-repo-teaches-vue.md`) is not required to gain a `readTime`
  field retroactively.

## Capabilities

### New Capabilities

- `vue-blog-post-skill`: a Claude Code Skill (not a subagent) that brainstorms candidate blog post
  topics within `docs-blog`'s declared scope and drafts complete, ready-to-publish posts through a
  six-stage task breakdown, in a fixed persona/tone/length contract.

### Modified Capabilities

- `docs-blog`: the post frontmatter schema requirement gains a required `readTime` field (integer
  minutes), computed from the post's word count.

## Impact

- New files: `.claude/skills/vue-blog-post/SKILL.md` (already written, predates this proposal —
  this change formalizes and extends it), `.claude/skills/vue-blog-post/references/scope-and-format.md`
  (to be written per this change's tasks).
- Superseded, to be archived without implementation: `openspec/changes/add-blog-post-agent/` (no
  `.claude/agents/blog-post-filler.md` will be created).
- Modified: `openspec/specs/docs-blog/spec.md`'s "Post frontmatter schema" requirement (adds `readTime`).
- No changes to `docs/.vitepress/config.mts`, `docs/blog/index.md`, `docs/blog/index.data.mts`, or any
  existing post file.
