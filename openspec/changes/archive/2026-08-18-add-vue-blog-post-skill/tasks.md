## 1. Archive the superseded proposal

- [x] 1.1 Move `openspec/changes/add-blog-post-agent/` into `openspec/changes/archive/`
      (following the existing `archive/2026-08-18-vue-ecosystem-blog/` naming convention), marking it
      superseded rather than implemented — no `.claude/agents/blog-post-filler.md` file is created.
- [x] 1.2 Confirm the archived proposal's own files are left unedited (a pointer to this change's
      proposal.md "Why" section is enough context; do not rewrite history inside the archived files).

## 2. `docs-blog` frontmatter delta

- [ ] 2.1 Apply the `readTime` field addition from `specs/docs-blog/spec.md`'s MODIFIED requirement to
      `openspec/specs/docs-blog/spec.md` once this change is archived (per standard OpenSpec archival
      flow — not a manual hand-edit before then).
- [x] 2.2 Confirm the existing inaugural post (`docs/blog/2026-08-18-how-this-repo-teaches-vue.md`) is
      left as-is; the exemption scenario in the spec delta covers it.

## 3. Skill reference file

- [x] 3.1 Write `.claude/skills/vue-blog-post/references/scope-and-format.md` containing: the
      `docs/blog/YYYY-MM-DD-slug.md` filename pattern, the full frontmatter field list (`title`, `date`,
      `tags`, `summary`, `readTime`), the `readTime = ceil(bodyWordCount / 200)` (min 1) formula, the
      two content lanes copied from `docs/blog/index.md`, and the exclusion of this repo's own
      exercise/release news.
- [x] 3.2 Update `.claude/skills/vue-blog-post/SKILL.md`'s Mode 2 (Draft) section to name the six
      explicit stages from design.md (topic scouting/dedupe, outline, draft, code-sample verification,
      frontmatter + `readTime` computation, final self-checklist) instead of the current three-step
      summary, so the stage boundaries are visible in the Skill's own instructions, not only in this
      change's design doc.
- [x] 3.3 Add the final self-checklist stage's concrete checks to `SKILL.md` or the reference file:
      word count within 1000-1500 (or an explicit stated reason for deviating), `readTime` computed
      from that same count, frontmatter fields complete, no duplicate topic per Brainstorm mode's dedupe
      step.

## 4. Live web research in Brainstorm mode

- [x] 4.1 Add a per-lane `WebSearch` step to `SKILL.md`'s Mode 1 (between the existing dedupe
      read and the shortlist step), scoped to roughly the last 1-3 months, preferring official
      sources per lane.
- [x] 4.2 Update the shortlist step to cite the source URL behind each timely candidate, and to
      label any candidate with no live-search trigger as evergreen rather than implying freshness
      it doesn't have.
- [x] 4.3 Fix the internal cross-reference in Draft mode's stage 1 ("Scout & dedupe"), which
      pointed at "Mode 1 step 2" before the renumber.
- [x] 4.4 Record the A/B/C/D comparison (inline search vs. parallel research `Workflow` vs.
      scheduled backlog scan vs. reviving `add-blog-post-agent` as a split pipeline) and the
      decision in `design.md`, replacing the now-resolved Open Question and the superseded
      Non-Goal.

## 5. Verification

- [x] 5.1 Smoke-test Brainstorm mode: invoke with no topic named, confirm a numbered shortlist returns
      with a cited source per timely candidate, confirm no file under `docs/blog/` changed, confirm
      scope stays within the two declared lanes.
- [x] 5.2 Smoke-test Draft mode on one shortlisted candidate: confirm all six stages run, confirm the
      resulting file matches the filename pattern and full frontmatter schema (including `readTime`),
      and confirm the body word count matches the `readTime` value via the documented formula.
- [x] 5.3 Run `pnpm docs:build` and confirm it succeeds with the new post present and with the existing
      inaugural post (still missing `readTime`) causing no failure, per the exemption scenario.

## 6. Sources footer on drafted posts

- [x] 6.1 Add a `## Sources` requirement to `SKILL.md`'s Draft mode stage 3 (draft ends with a
      markdown-link list, seeded from the Mode 1 citation) and stage 4 (append any additional URL
      a verification lookup surfaces).
- [x] 6.2 Document the section's format and placement in `SKILL.md` (a short example block) and
      exclude it from `readTime`'s `bodyWordCount` in `references/scope-and-format.md`, the same
      way the frontmatter block is already excluded.
- [x] 6.3 Add a self-checklist item in `references/scope-and-format.md` gating on the `## Sources`
      section's presence, with an explicit-absence escape hatch for a post that used nothing
      beyond existing training knowledge.
- [ ] 6.4 Smoke-test: draft one more post end-to-end and confirm the saved file has a `## Sources`
      section whose word count was correctly excluded from the `readTime` calculation.
