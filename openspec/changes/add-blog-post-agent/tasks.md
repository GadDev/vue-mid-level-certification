## 1. Prerequisite check

- [ ] 1.1 Confirm `vue-ecosystem-blog` has landed (at minimum, its `docs-blog` spec
      file is readable at `openspec/changes/vue-ecosystem-blog/specs/docs-blog/spec.md`
      or `openspec/specs/docs-blog/spec.md`) before starting section 2 — this change
      has nothing to reuse otherwise, per design.md's Migration Plan.

## 2. Agent scaffolding

- [ ] 2.1 Create `.claude/agents/blog-post-filler.md` with frontmatter: `name`,
      `description` (per proposal.md's capability summary), `tools: Read, Write, Glob,
      Grep` (no `Edit`, no `Bash` — per design.md's tool-access decision).
- [ ] 2.2 Write the mode-switch rule at the top of the instruction body: no specific
      post topic named in the invocation → analysis mode; a specific topic named →
      build mode.

## 3. Analysis mode

- [ ] 3.1 Instruct the agent to survey `docs-blog`'s declared content scope (Vue
      core/ecosystem releases, tooling changes, AI tooling relevant to Vue
      development) for candidate topics, per spec requirement "Analysis mode
      proposes candidate posts without writing files."
- [ ] 3.2 Instruct the agent to exclude topics outside that scope, notably this
      repo's own exercise/release news (which has its own channel per
      `vue-ecosystem-blog`'s proposal).
- [ ] 3.3 Instruct the agent to read `title`/`tags`/`summary` frontmatter from every
      file under `docs/blog/` and to omit or flag candidates that substantially
      overlap an existing post, per spec requirement "Duplicate detection reads
      existing post frontmatter."
- [ ] 3.4 Instruct the agent's analysis-mode output format: a numbered shortlist of
      candidates (working title, topic, why it's timely, rough scope, and which
      existing post — if any — it was checked against), and state explicitly that
      this mode writes no files.

## 4. Build mode

- [ ] 4.1 Instruct the agent to locate and read the `docs-blog` capability's spec
      (pre-archive or post-archive path) for the filename pattern, frontmatter
      fields, and content-scope rules, per spec requirement "Build mode reuses the
      docs-blog capability's conventions."
- [ ] 4.2 Instruct the agent to stop and report (without writing a post file) if
      neither `docs-blog` spec path can be read.
- [ ] 4.3 Instruct the agent to draft a complete, self-contained post (introduction,
      body content, closing note) matching the `docs-blog` frontmatter contract, in a
      single invocation once a topic is named or confirmed — never a stub or outline,
      per spec requirement "Draft posts are self-contained and require confirmation
      before writing."
- [ ] 4.4 Instruct the agent to report the exact file path written and a one-line
      summary of the post's content once drafted.

## 5. Verification

- [ ] 5.1 Smoke-test analysis mode: invoke the agent with no topic named, confirm it
      returns a numbered shortlist, confirm no files under `docs/blog/` changed, and
      confirm no candidate falls outside `docs-blog`'s declared scope.
- [ ] 5.2 Smoke-test the missing-dependency path: temporarily rename or point the
      agent at a nonexistent `docs-blog` spec path and confirm build mode reports the
      missing contract and writes nothing.
- [ ] 5.3 Smoke-test build mode on one shortlisted candidate (once `vue-ecosystem-blog`
      is implemented) and confirm the resulting file matches `docs-blog`'s filename
      and frontmatter conventions and reads as a complete, publishable post.
