## ADDED Requirements

### Requirement: Analysis mode proposes candidate posts without writing files
When invoked without a specific post topic named in the prompt, the agent SHALL
survey `docs-blog`'s declared content scope (Vue core/ecosystem releases, tooling
changes, and AI tooling relevant to Vue development), cross-check candidates against
existing posts under `docs/blog/`, and return a numbered shortlist of candidate posts
(working title, topic, why it's timely, rough scope) as its final output. It SHALL
NOT create or edit any post file in this mode.

#### Scenario: Invoked with no topic named
- **WHEN** the agent is invoked with a prompt that does not name a specific post
  topic to write
- **THEN** it returns a numbered shortlist of candidate post topics with rationale
- **AND** no files under `docs/blog/` are created or modified

#### Scenario: Candidate list excludes out-of-scope topics
- **WHEN** the agent evaluates candidate topics against `docs-blog`'s content-scope
  boundary (excluding this repo's own exercise/release news, which has its own
  channel)
- **THEN** none of those out-of-scope topics appear in the returned shortlist

### Requirement: Duplicate detection reads existing post frontmatter
The agent SHALL read the `title`, `tags`, and `summary` frontmatter of each existing
file under `docs/blog/` and SHALL exclude, or explicitly flag as overlapping, any
candidate topic that substantially duplicates an already-published post, rather than
comparing only filenames or slugs.

#### Scenario: Candidate overlaps an existing post
- **WHEN** a candidate topic substantially overlaps the topic of an existing post
  under `docs/blog/`, as judged from that post's frontmatter
- **THEN** the agent's analysis output either omits that candidate or flags it as
  overlapping with the specific existing post it duplicates

### Requirement: Build mode reuses the docs-blog capability's conventions
When invoked with a specific post topic named in the prompt, the agent SHALL read the
`docs-blog` capability's spec (`openspec/changes/vue-ecosystem-blog/specs/docs-blog/spec.md`
before that change is archived, or `openspec/specs/docs-blog/spec.md` after) for the
filename pattern, frontmatter fields, and content-scope rules, and SHALL follow that
contract rather than a separately maintained convention.

#### Scenario: Invoked with a named topic to draft
- **WHEN** the agent is invoked with a prompt naming a specific post topic to write
  (either one from its own prior analysis-mode output, or one the user supplies
  directly)
- **THEN** the agent drafts a complete post file at `docs/blog/YYYY-MM-DD-slug.md` (or
  whichever filename pattern `docs-blog`'s spec currently defines) with frontmatter
  matching that spec's fields

#### Scenario: docs-blog capability is unavailable
- **WHEN** the agent is invoked in build mode but neither
  `openspec/changes/vue-ecosystem-blog/specs/docs-blog/spec.md` nor
  `openspec/specs/docs-blog/spec.md` can be read
- **THEN** the agent reports that the `docs-blog` contract is missing and stops
  without writing any post file

### Requirement: Draft posts are self-contained and require confirmation before writing
The agent SHALL treat naming a topic (in analysis output or directly by the user) as
confirmation to draft, and SHALL produce a complete, self-contained post body (not an
outline or stub) in a single build-mode invocation. The agent SHALL NOT write a post
file during analysis mode, and SHALL NOT publish or draft any post the user has not
named or confirmed.

#### Scenario: Build mode produces a complete draft
- **WHEN** build mode drafts a post for a confirmed topic
- **THEN** the resulting file contains a complete post body (introduction, body
  content, and a closing note), not a placeholder or outline requiring further
  authoring before it could be published
