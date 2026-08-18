## Context

The docs site is a single VitePress instance (`docs/.vitepress/config.mts`) with a flat `nav`/`sidebar` array pointing at hand-authored top-level `.md` files (`SETUP.md`, `LEARNING_PATH.md`, `PATTERNS.md`, `ANTI_PATTERNS.md`). There is no existing content collection, no dated-post pattern, and no dependency beyond `vitepress` itself in that tree. `pnpm docs:build` runs in CI; `ignoreDeadLinks: [/\.\.\//]` is already scoped to tolerate the repo's cross-links out of `docs/` (to the root README and `packages/*`), so any new internal links inside `docs/blog/` are still checked by the existing dead-link check — nothing to loosen there. Biome does not lint anything under `docs/` (confirmed in `CLAUDE.md`), so this section's markdown/frontmatter has no lint safety net beyond the VitePress build itself succeeding.

## Goals / Non-Goals

**Goals:**

- A `docs/blog/` content tree where adding one new dated Markdown file is the only step needed to publish a post.
- An index page that lists posts newest-first, generated from frontmatter rather than hand-maintained.
- A defined, written-down content scope so future posts (by me or anyone contributing) don't drift into being release notes for this repo itself (that's what `meta/release/CHANGELOG.md` is for).
- One inaugural post live at launch, repurposing `LEARNING_PATH.md`.

**Non-Goals:**

- No tag-filtering pages or per-tag archives — tags are shown as plain text on each post/listing entry, not a navigable taxonomy. Revisit only if the post count grows enough to need it.
- No RSS/Atom feed. VitePress has no built-in feed generation; adding one means a new dependency (e.g. `vitepress-plugin-feed`) for a feature nothing has asked for yet.
- No pagination on the index page — fine unpaginated up to a few dozen posts.
- No automation for *finding or drafting* future posts (e.g. a scheduled agent watching Vue release feeds). That's a separate concern from "does the blog section exist and work," and — per the discussion this proposal came out of — is deliberately being tracked as its own, separate initiative rather than bundled here.
- No comments/reactions system.

## Decisions

**Content loader over a hand-maintained index.** VitePress ships `createContentLoader` specifically for this — a `.data.ts` file globs `docs/blog/*.md`, reads frontmatter, and returns a sorted array a Vue component renders. The alternative (a hand-edited list of links on `docs/blog/index.md`) is what the existing sidebar already does for the four static guide pages, but a blog is exactly the case where that goes stale — someone adds `docs/blog/2026-09-01-post.md` and forgets to also add the index entry. Zero new dependencies either way; `createContentLoader` is part of `vitepress` itself.

**Filename convention: `docs/blog/YYYY-MM-DD-slug.md`.** The date lives in both the filename and the frontmatter (`date: 2026-09-01`). Redundant, but the filename ordering makes `ls docs/blog/` human-scannable without opening files, while the frontmatter date is what the content loader actually sorts and displays by (a renamed file shouldn't silently change its displayed date).

**Frontmatter schema:** `title`, `date` (ISO string), `tags` (string array), `summary` (one-liner shown on the index card). No `author` field — this is a solo-maintained repo; if that changes, add it then.

**Separate sidebar scope for `/blog/`, existing sidebar untouched.** VitePress supports path-scoped sidebars (an object keyed by path prefix instead of a flat array). `/` keeps the current four-item "Guide" sidebar; `/blog/` gets its own (index + posts, or just relies on the index page's list and an "Outline" on individual posts). This avoids the blog's post count polluting the existing guide nav the way the flat array would.

**Content scope is enforced by documentation, not tooling.** A short "what belongs here" note at the top of `docs/blog/index.md` (or a `docs/blog/README.md`-equivalent convention note) is the only guardrail — consistent with how this repo already governs quality (`docs/RELEASING.md`'s bump-type conventions, `CLAUDE.md`'s rules) through written docs rather than lint rules, since Biome doesn't reach `docs/` anyway.

**No new CI job.** The existing `docs:build` CI step already builds every page under `docs/`; a broken post (bad frontmatter, a dead internal link) fails that build the same way a broken guide page would today.

## Risks / Trade-offs

- **Content rot** — a post asserting "the latest Vue release is X" ages the moment a newer one ships. → Mitigation: every post is dated in the UI (frontmatter `date` rendered on the card and post page), and the content-scope note explicitly asks posts to frame claims as "as of `<date>`," not "latest."
- **No lint coverage under `docs/`** — a malformed frontmatter block fails silently at the content-loader level (post just doesn't render/sort right) rather than at `pnpm check`. → Mitigation: `pnpm docs:build` in CI still catches anything that breaks the actual build; frontmatter shape errors that don't break the build are a cosmetic risk, not a correctness one.
- **Scope creep into automation** — it's tempting to fold in "and also auto-generate these" once the section exists. → Mitigation: explicitly called out as a Non-Goal above; the separate automation idea should get its own proposal so this one stays shippable on its own.

## Open Questions

- Should the homepage (`docs/index.md`, if it's a VitePress "home" layout) link to the blog directly, or is the nav entry sufficient? (Low-stakes; can be decided during implementation.)
- If/when this blog needs a feed or tag pages, that's a follow-up proposal, not a retrofit into this one's tasks.
