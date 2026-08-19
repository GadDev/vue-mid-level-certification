# docs-blog

## Purpose

Defines the VitePress-hosted blog under `docs/blog/`: its nav entry, post filename and
frontmatter contract, automatic content-loader-driven index, sidebar scoping, declared content
scope, and inaugural post — so contributors have one authoritative source for what a valid post
looks like and how it gets published.
## Requirements
### Requirement: Blog navigation entry
The VitePress docs site's top nav SHALL include a "Blog" entry linking to the blog index page.

#### Scenario: Nav link is present on every page
- **WHEN** a visitor loads any page of the docs site
- **THEN** the top nav bar shows a "Blog" link pointing at `/blog/`

### Requirement: Post frontmatter schema
Every file under `docs/blog/` that represents a post SHALL declare `title`, `date`, `tags`, `summary`,
and `readTime` in its frontmatter. `date` SHALL be an ISO `YYYY-MM-DD` string matching the date encoded
in the post's filename. `readTime` SHALL be a positive integer representing estimated minutes to read,
computed as `ceil(bodyWordCount / 200)` with a minimum value of 1, where `bodyWordCount` excludes the
frontmatter block itself and, when present, the post's closing `## Sources` section. Posts published
before this requirement took effect are exempt from the `readTime` field until they are next revised.

#### Scenario: Post missing a required field fails the build
- **WHEN** a post under `docs/blog/` published after this requirement took effect omits `title`,
  `date`, `tags`, `summary`, or `readTime` from its frontmatter
- **THEN** `pnpm docs:build` fails or the content loader errors, surfacing the problem before it
  reaches the deployed site

#### Scenario: Filename date matches frontmatter date
- **WHEN** a post is named `docs/blog/YYYY-MM-DD-slug.md`
- **THEN** its frontmatter `date` field equals that same `YYYY-MM-DD` value

#### Scenario: readTime reflects the post's actual body length
- **WHEN** a post declares a `readTime` value
- **THEN** that value equals `ceil(bodyWordCount / 200)` (minimum 1) for that post's actual body word
  count, excluding the frontmatter block and any closing `## Sources` section, not an estimate made
  before the post was drafted

#### Scenario: Pre-existing posts are exempt
- **WHEN** a post under `docs/blog/` was published before this requirement took effect and has not
  since been revised
- **THEN** its lack of a `readTime` field does not fail `pnpm docs:build`

### Requirement: Automatic post listing
The blog index page SHALL enumerate every post under `docs/blog/` via a content loader (not a hand-maintained link list), sorted newest-first by frontmatter `date`, showing each post's `title`, `date`, `tags`, and `summary`.

#### Scenario: Adding a post file is sufficient to publish it
- **WHEN** a new valid post file is added under `docs/blog/` with no other file changed
- **THEN** it appears in the index page's list, in the correct chronological position, after the next build

#### Scenario: Index page requires no manual link maintenance
- **WHEN** a contributor inspects the index page's implementation
- **THEN** it derives its list from frontmatter via `createContentLoader` rather than containing a hand-written list of links to individual posts

### Requirement: Blog-scoped sidebar
The docs site's sidebar for paths under `/blog/` SHALL be distinct from the sidebar shown for the existing top-level guide pages (`SETUP`, `LEARNING_PATH`, `PATTERNS`, `ANTI_PATTERNS`), so blog posts do not appear in — or clutter — the guide sidebar.

#### Scenario: Guide sidebar is unaffected
- **WHEN** a visitor is on `/SETUP`, `/LEARNING_PATH`, `/PATTERNS`, or `/ANTI_PATTERNS`
- **THEN** the sidebar shown is the existing four-item "Guide" list, unchanged by the blog section's existence

#### Scenario: Blog sidebar shown under /blog/
- **WHEN** a visitor is on `/blog/` or an individual post page under it
- **THEN** the sidebar shown is scoped to blog navigation, not the Guide sidebar

### Requirement: Defined content scope
The blog SHALL document its own content scope — Vue core/ecosystem releases, ecosystem tooling (Vite, Pinia, Vue Router, Nuxt, Vitest, VueUse, etc.), and AI tooling relevant to Vue development — and SHALL explicitly exclude this repo's own release/changelog news, which is covered by `meta/release/CHANGELOG.md`.

#### Scenario: Scope note is discoverable
- **WHEN** a contributor opens `docs/blog/index.md` (or an equivalent contributor-facing note in that directory)
- **THEN** they find a written statement of what topics belong in this blog and an explicit pointer to `meta/release/CHANGELOG.md` for this repo's own release notes

### Requirement: Inaugural post
The blog SHALL launch with at least one published post that repurposes `docs/LEARNING_PATH.md`'s per-exercise rationale ("what each one is really teaching") into a narrative piece about this repo's design.

#### Scenario: First post is live at launch
- **WHEN** the blog section ships
- **THEN** the index page lists at least one post, and that post's content is derived from `LEARNING_PATH.md`'s existing rationale rather than being unrelated placeholder content

### Requirement: Build integrity with the blog section present
`pnpm docs:build` SHALL continue to succeed, including dead-link checking, with the blog section (index page and all posts) included in the build.

#### Scenario: CI docs build passes with the blog section
- **WHEN** the CI workflow runs `pnpm docs:build` on a commit that includes the blog section
- **THEN** the build completes successfully with no dead-link or content-loader errors

