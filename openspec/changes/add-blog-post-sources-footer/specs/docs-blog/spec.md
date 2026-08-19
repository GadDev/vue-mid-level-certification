## MODIFIED Requirements

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
