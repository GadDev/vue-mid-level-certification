## 1. Implementation (already done, predates this proposal)

- [x] 1.1 Add the `## Sources` requirement to `SKILL.md`'s Draft mode stage 3 (seeded from the Mode 1
      citation) and stage 4 (append verification-lookup URLs).
- [x] 1.2 Document the section's format/placement in `SKILL.md` and exclude it from `readTime`'s
      `bodyWordCount` in `references/scope-and-format.md`.
- [x] 1.3 Add the self-checklist gate for the `## Sources` section, with an explicit-absence escape
      hatch.

## 2. Spec deltas (this proposal's actual job)

- [x] 2.1 Write `specs/vue-blog-post-skill/spec.md`'s ADDED requirement describing the Sources-footer
      behavior, so the archived `vue-blog-post-skill` capability spec matches what `SKILL.md` does.
- [x] 2.2 Write `specs/docs-blog/spec.md`'s MODIFIED requirement widening the `readTime`
      `bodyWordCount` exclusion to cover the `## Sources` section.

## 3. Verification

- [x] 3.1 `openspec validate add-blog-post-sources-footer --strict` passes.
- [x] 3.2 Draft one more post end-to-end and confirm the saved file has a `## Sources` section whose
      word count was correctly excluded from the `readTime` calculation (carried over from
      `add-vue-blog-post-skill`'s unfinished task 6.4, orphaned by that change's archival).
