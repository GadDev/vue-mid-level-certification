## 1. Archive the superseded proposal

- [ ] 1.1 Move `openspec/changes/add-blog-post-agent/` into `openspec/changes/archive/`
      (following the existing `archive/2026-08-18-vue-ecosystem-blog/` naming convention), marking it
      superseded rather than implemented — no `.claude/agents/blog-post-filler.md` file is created.
- [ ] 1.2 Confirm the archived proposal's own files are left unedited (a pointer to this change's
      proposal.md "Why" section is enough context; do not rewrite history inside the archived files).

## 2. `docs-blog` frontmatter delta

- [ ] 2.1 Apply the `readTime` field addition from `specs/docs-blog/spec.md`'s MODIFIED requirement to
      `openspec/specs/docs-blog/spec.md` once this change is archived (per standard OpenSpec archival
      flow — not a manual hand-edit before then).
- [ ] 2.2 Confirm the existing inaugural post (`docs/blog/2026-08-18-how-this-repo-teaches-vue.md`) is
      left as-is; the exemption scenario in the spec delta covers it.

## 3. Skill reference file

- [ ] 3.1 Write `.claude/skills/vue-blog-post/references/scope-and-format.md` containing: the
      `docs/blog/YYYY-MM-DD-slug.md` filename pattern, the full frontmatter field list (`title`, `date`,
      `tags`, `summary`, `readTime`), the `readTime = ceil(bodyWordCount / 200)` (min 1) formula, the
      two content lanes copied from `docs/blog/index.md`, and the exclusion of this repo's own
      exercise/release news.
- [ ] 3.2 Update `.claude/skills/vue-blog-post/SKILL.md`'s Mode 2 (Draft) section to name the six
      explicit stages from design.md (topic scouting/dedupe, outline, draft, code-sample verification,
      frontmatter + `readTime` computation, final self-checklist) instead of the current three-step
      summary, so the stage boundaries are visible in the Skill's own instructions, not only in this
      change's design doc.
- [ ] 3.3 Add the final self-checklist stage's concrete checks to `SKILL.md` or the reference file:
      word count within 1000-1500 (or an explicit stated reason for deviating), `readTime` computed
      from that same count, frontmatter fields complete, no duplicate topic per Brainstorm mode's dedupe
      step.

## 4. Verification

- [ ] 4.1 Smoke-test Brainstorm mode: invoke with no topic named, confirm a numbered shortlist returns,
      confirm no file under `docs/blog/` changed, confirm scope stays within the two declared lanes.
- [ ] 4.2 Smoke-test Draft mode on one shortlisted candidate: confirm all six stages run, confirm the
      resulting file matches the filename pattern and full frontmatter schema (including `readTime`),
      and confirm the body word count matches the `readTime` value via the documented formula.
- [ ] 4.3 Run `pnpm docs:build` and confirm it succeeds with the new post present and with the existing
      inaugural post (still missing `readTime`) causing no failure, per the exemption scenario.
