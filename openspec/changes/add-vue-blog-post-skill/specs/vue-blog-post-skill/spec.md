## ADDED Requirements

### Requirement: Skill triggers on blog-writing tasks
`.claude/skills/vue-blog-post/SKILL.md` SHALL declare a `description` naming the trigger conditions
(pitching blog topics, writing a blog post, creating or updating a file under `docs/blog/`), the output
(a complete, ready-to-publish post matching `docs-blog`'s frontmatter contract), and a distinctive
marker (the fixed persona/tone/length contract), so Claude can determine relevance before loading the
full instructions.

#### Scenario: Description names an explicit trigger
- **WHEN** a contributor inspects `.claude/skills/vue-blog-post/SKILL.md`'s frontmatter `description`
- **THEN** it names when the Skill applies, what it produces, and what distinguishes it from writing
  a post without the Skill

### Requirement: Brainstorm mode proposes candidates without writing files
When invoked without a specific post topic named in the request, the Skill SHALL survey `docs-blog`'s
declared content scope (read from `docs/blog/index.md`), read `title`/`tags`/`summary` frontmatter from
every existing file under `docs/blog/` to avoid duplicates, and return a numbered shortlist of candidate
posts (working title, content lane, why it's timely, rough scope, and any existing post it overlaps).
It SHALL NOT create or edit any file under `docs/blog/` in this mode.

#### Scenario: Invoked with no topic named
- **WHEN** the Skill is invoked with a request that does not name a specific post topic
- **THEN** it returns a numbered shortlist of candidate topics with rationale
- **AND** no file under `docs/blog/` is created or modified

#### Scenario: Candidate overlaps an existing post
- **WHEN** a candidate topic substantially overlaps an existing post's frontmatter summary
- **THEN** the shortlist either omits that candidate or flags it by name against the specific existing
  post it overlaps

### Requirement: Draft mode runs as six explicit stages
The Skill SHALL execute Draft mode as six tracked stages — topic scouting/dedupe, outline, draft,
code-sample verification, frontmatter and `readTime` computation, final self-checklist — once a topic
is named or confirmed (from the Skill's own Brainstorm output or given directly), producing a complete,
self-contained post body (introduction, body sections, closing note), not an outline or stub, by the
end of the sequence.

#### Scenario: Draft mode produces a complete post
- **WHEN** Draft mode completes all six stages for a confirmed topic
- **THEN** the resulting file at `docs/blog/YYYY-MM-DD-slug.md` contains a complete post body requiring
  no further authoring before publication

#### Scenario: A maintainer can redirect after any stage
- **WHEN** a maintainer reviews progress after any one of the six stages (e.g. the outline or a code
  sample) before the final file is written
- **THEN** they can request a change to that stage's output before the Skill proceeds to the next stage

### Requirement: Voice, tone, and length contract
Every post the Skill drafts SHALL be written in a senior-Vue-engineer practitioner voice with an
enthusiastic, trend-forward tone, targeting 1000-1500 words of body content (excluding frontmatter),
per the contract documented in `.claude/skills/vue-blog-post/references/scope-and-format.md`.

#### Scenario: Draft matches the length target
- **WHEN** Draft mode's final self-checklist stage runs
- **THEN** the draft's body word count falls within 1000-1500 words, or the Skill states explicitly why
  the confirmed topic warranted deviating from that range

### Requirement: Reference file holds the format contract, not the SKILL.md core
`.claude/skills/vue-blog-post/references/scope-and-format.md` SHALL hold the filename pattern, the full
frontmatter schema (including the `readTime` formula), and the content-scope boundary, read by Draft
mode before writing frontmatter, rather than that contract being duplicated inline in `SKILL.md`'s core
instructions.

#### Scenario: Reference file is the single source for the format contract
- **WHEN** Draft mode needs the filename pattern or frontmatter field list
- **THEN** it reads `references/scope-and-format.md` rather than a convention embedded only in
  `SKILL.md`'s core body
