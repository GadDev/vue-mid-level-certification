## 1. Content structure

- [x] 1.1 Create `docs/blog/` directory with the `YYYY-MM-DD-slug.md` filename convention documented (in the scope note from task 4.1).
- [x] 1.2 Define the frontmatter schema (`title`, `date`, `tags`, `summary`) and confirm it renders correctly through VitePress's default frontmatter handling.

## 2. Listing & navigation

- [x] 2.1 Add `docs/blog/index.data.mts` using `createContentLoader('blog/*.md')` to return posts sorted newest-first by frontmatter `date`. (`.mts`, not `.ts` — the root `package.json` has no `"type": "module"`, and `.ts` resolves as CJS during config bundling, which fails because `vitepress` is ESM-only. `config.mts` already uses the same `.mts` workaround.)
- [x] 2.2 Add `docs/blog/index.md` that consumes the loader's data and renders each post's `title`, `date`, `tags`, `summary`, and a link to the full post.
- [x] 2.3 Update `docs/.vitepress/config.mts`: add a `{ text: 'Blog', link: '/blog/' }` nav entry.
- [x] 2.4 Update `docs/.vitepress/config.mts`: convert `themeConfig.sidebar` to the path-scoped object form so `/` keeps the existing four-item Guide sidebar and `/blog/` gets its own (distinct) sidebar config.

## 3. Content scope

- [x] 3.1 Write the content-scope note at the top of `docs/blog/index.md` (or a co-located contributor note): what belongs here (Vue core/ecosystem releases, tooling, AI tooling for Vue), and an explicit pointer to `meta/release/CHANGELOG.md` for this repo's own release notes.

## 4. Inaugural post

- [x] 4.1 Draft `docs/blog/<launch-date>-how-this-repo-teaches-vue.md` (or similar slug), repurposing `docs/LEARNING_PATH.md`'s "what each one is really teaching" material into a narrative post, with correct frontmatter.
- [x] 4.2 Cross-check the post's internal links (to `LEARNING_PATH.md`, `PATTERNS.md`, etc.) resolve under VitePress's `cleanUrls: true` + existing `ignoreDeadLinks` config.

## 5. Verification

- [x] 5.1 Run `pnpm docs:build` locally and confirm it succeeds with the new section, including dead-link checking.
- [x] 5.2 Run `pnpm docs:dev` and manually check: nav "Blog" link, index page listing/order, blog-scoped sidebar vs. guide sidebar on `/SETUP`, and the inaugural post's rendering. (`docs:dev` serves a client-rendered SPA shell, so a bare `curl` shows an empty `<div id="app">`; verified instead via the `docs:build` SSG output — `dist/blog/index.html` contains the post's title/date/tags, and `dist/blog/2026-08-18-how-this-repo-teaches-vue.html` exists — plus a 200 from the dev server on that route.)
- [x] 5.3 Add a changeset (`pnpm changeset`, `minor` per `docs/RELEASING.md`'s "a new doc" convention) with a descriptive filename per the updated `docs/RELEASING.md` guidance.
- [x] 5.4 Update root `README.md` (or the docs homepage) with a link into the new Blog section, if not already reachable from there.
