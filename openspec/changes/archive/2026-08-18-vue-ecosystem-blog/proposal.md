## Why

The docs site (VitePress, deployed to GitHub Pages) currently only holds static reference material — `PATTERNS.md`, `LEARNING_PATH.md`, `ANTI_PATTERNS.md`, `SETUP.md`, `RELEASING.md` — none of which is time-stamped or ever revisited after it's written. There's no channel on the site for ongoing commentary: new Vue releases, ecosystem tooling changes, or AI tooling that's showing up around Vue (component generators, AI-assisted dev tools, agent frameworks targeting Vue codebases). Adding one gives the docs site a reason for a repeat visit, and a natural home for the "how this repo teaches Vue" post that repurposes `LEARNING_PATH.md`'s existing syllabus-with-rationale content as an inaugural entry.

## What Changes

- Add a "Blog" section to the VitePress docs site: nav entry, a listing/index page, and per-post markdown files with frontmatter (`title`, `date`, `tags`, `summary`).
- Establish a lightweight post template and a naming/dating convention (e.g. `docs/blog/YYYY-MM-DD-slug.md`) so posts sort and link predictably.
- Define an explicit content scope for what belongs in this blog: Vue core/ecosystem releases, notable tooling changes (Vite, Pinia, Vue Router, Nuxt, Vitest, VueUse, etc.), and AI tooling relevant to Vue development — explicitly excluding this repo's own exercise/changelog news, which already has a channel (`meta/release/CHANGELOG.md`).
- Wire the listing page to enumerate posts automatically (VitePress's `createContentLoader`) rather than a hand-maintained list, so adding a post file is the only step needed to have it appear.
- Write and publish one inaugural post repurposing `docs/LEARNING_PATH.md`'s "what each one is really teaching" material into a narrative piece about the repo's design.

## Capabilities

### New Capabilities

- `docs-blog`: A blog section inside the VitePress docs site — index/listing page, per-post pages, frontmatter conventions, and a defined content scope (Vue ecosystem releases, tooling, and AI-tooling-for-Vue commentary).

### Modified Capabilities

_None — `openspec/specs/` is currently empty; this is the first capability defined for this repo's docs site._

## Impact

- `docs/.vitepress/config.mts`: new nav entry and (if used) theme config for the listing page.
- New content tree: `docs/blog/` (post files) plus an index page (e.g. `docs/blog/index.md`) using `createContentLoader`.
- `docs/blog/index.md`'s listing logic and the post template are new site code — the VitePress build (`pnpm docs:build`, wired into CI) needs to keep passing with the new section in place.
- Root `README.md` / docs site homepage: a link into the new Blog section (optional, but likely desired for discoverability).
- A changeset under `.changeset/` documenting this as a docs addition (per `docs/RELEASING.md`'s convention — this is a `minor` per that doc's bump-type guidance: "an addition: a new exercise, a new doc, new tooling").
