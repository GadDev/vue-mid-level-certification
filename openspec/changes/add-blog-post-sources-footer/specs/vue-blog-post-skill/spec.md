## ADDED Requirements

### Requirement: Draft mode appends a Sources section
Every post Draft mode produces SHALL end with a `## Sources` section listing, as markdown links, every
URL that informed the post: at minimum the Mode 1 citation behind the confirmed topic, plus any
additional URL a stage-4 verification lookup surfaces. A post drafted from a topic with no live-search
citation (an evergreen candidate, or a topic handed directly to Draft mode) SHALL either include a
`## Sources` section for whatever it did consult, or state explicitly in the final self-checklist that
nothing beyond existing training knowledge was used, rather than silently omitting the section.

#### Scenario: Draft mode's post ends with sources
- **WHEN** Draft mode completes a post drafted from a Brainstorm-mode candidate that cited a live
  source
- **THEN** the saved file's body ends with a `## Sources` section containing that citation as a
  markdown link

#### Scenario: Verification lookup adds to the Sources section
- **WHEN** stage 4 (verify code samples) consults a URL not already in the Sources section drafted in
  stage 3
- **THEN** that URL is added to the Sources section before the file is saved

#### Scenario: No sources used is stated explicitly
- **WHEN** a post is drafted using nothing beyond existing training knowledge (no live search, no
  verification lookup)
- **THEN** the final self-checklist states that explicitly rather than silently omitting a `## Sources`
  section with no explanation
