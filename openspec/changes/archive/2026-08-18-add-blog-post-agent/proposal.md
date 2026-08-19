## Why

`vue-ecosystem-blog` (proposed, not yet implemented) gives the docs site a blog
section, but adding a post is still entirely manual: someone has to notice a
worthwhile Vue release, ecosystem change, or AI-tooling-for-Vue development, then
hand-write a dated markdown file matching the blog's conventions. There is no
repeatable way to ask "what's worth writing about right now, and can you draft it,"
so posts will only appear when a human happens to remember to write one.

## What Changes

- Add a new Claude Code subagent (`.claude/agents/blog-post-filler.md`) that:
  - Surveys candidate topics in the docs-blog's declared scope — Vue core/ecosystem
    releases, tooling changes (Vite, Pinia, Vue Router, Nuxt, Vitest, VueUse, etc.),
    and AI tooling relevant to Vue development — and excludes anything already
    covered by an existing post under `docs/blog/`.
  - Proposes one or more candidate posts (working title, topic, why it's timely,
    rough scope) and stops for confirmation before writing anything.
  - On confirmation, drafts a complete post file following the `docs-blog`
    capability's conventions (filename pattern, frontmatter fields, content-scope
    rules) established by `vue-ecosystem-blog`, rather than inventing its own format.
- This proposal depends on `vue-ecosystem-blog` being implemented first — the agent
  reads that capability's spec for the filename/frontmatter/scope contract instead of
  guessing at it. If `vue-ecosystem-blog` hasn't landed yet, the agent has nothing to
  read and should say so rather than improvising a convention.
- No changes to `vue-ecosystem-blog`'s own scaffolding, the VitePress config, or the
  existing exercise-authoring tooling (`new-exercise.md`, `exercise-gap-filler.md`).

## Capabilities

### New Capabilities

- `blog-post-agent`: a subagent that surveys the Vue ecosystem and AI-tooling-for-Vue
  space for post-worthy topics not yet covered on the docs blog, proposes candidates,
  and — once a topic is confirmed — drafts a complete post file conforming to the
  `docs-blog` capability's conventions.

### Modified Capabilities

_None — this does not change requirements for `docs-blog` or any other existing
capability; it consumes `docs-blog`'s conventions as a dependency._

## Impact

- New file: `.claude/agents/blog-post-filler.md` (name finalized in design.md).
- Reads (never edits): `openspec/changes/vue-ecosystem-blog/specs/docs-blog/spec.md`
  (or its archived equivalent under `openspec/specs/docs-blog/spec.md` once merged)
  for filename, frontmatter, and content-scope conventions; `docs/blog/*.md` to avoid
  duplicate topics.
- Writes (only after user confirmation): a new `docs/blog/YYYY-MM-DD-slug.md` post
  file, matching whatever convention `docs-blog` defines.
- No changes to `openspec/specs/` for any existing capability.
- Hard dependency: `vue-ecosystem-blog` must be implemented (docs-blog structure and
  conventions in place) before this agent's build mode has a contract to follow.
