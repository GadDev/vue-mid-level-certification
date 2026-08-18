# Releasing

This repo is `private: true` — nothing is ever published to npm. "Releasing" here means two things: a versioned, changelog'd snapshot of the repo (via [Changesets](https://github.com/changesets/changesets)) and, optionally, a GitHub Release built from that changelog.

There's a real constraint behind the shape of this: **Changesets cannot version a pnpm workspace's root `package.json`** — its release-plan step drops whatever it identifies as the workspace root, regardless of `ignore`/`privatePackages` config. So a code-free package, `meta/release` (`@practice/release`), exists purely to be the thing Changesets versions on the repo's behalf. Its `version` and `CHANGELOG.md` represent the whole repository, not that folder specifically.

## The day-to-day flow

1. **Make a change worth calling out** — a new exercise, a docs rewrite, a CI change, a fixed bug in a solution.

2. **Add a changeset:**

   ```bash
   pnpm changeset
   ```

   This prompts for a bump type (patch/minor/major — see [below](#choosing-a-bump-type)) and a summary, then writes a file into `.changeset/`. Name it to something that reflects the change (e.g. `.changeset/remove-anti-patterns-nav-link.md`) before committing — a `.changeset/` directory full of random slugs is hard to skim in a PR diff; the filename should tell a reviewer what's in it without opening the file. Commit it with your PR.

   Not every PR needs one. A typo fix or an internal refactor with no visible effect can skip this step.

3. **Merge your PR to `main`.** The "Changesets Release" workflow (`.github/workflows/changesets.yml`) notices the pending changeset(s) and opens (or updates) a PR titled **"chore: version packages"**. That PR's diff is entirely mechanical: `meta/release/package.json`'s version bumped, `meta/release/CHANGELOG.md` rewritten with every pending changeset's summary, and the consumed `.changeset/*.md` files deleted.

   If more changesets land on `main` before that PR is merged, the workflow keeps updating the same PR rather than opening a new one — so a batch of several small changes becomes one version bump, not one per PR.

4. **Merge the "Version Packages" PR when you're ready to cut a release.** This is the actual decision point — nothing bumps a version number without a human merging that PR.

5. **(Optional) Tag the release**, using the version `meta/release/package.json` now has:

   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

   Pushing a `v*.*.*` tag triggers `.github/workflows/release.yml`, which publishes a GitHub Release with that version's section of `meta/release/CHANGELOG.md` as the release notes.

## Choosing a bump type

Since `@practice/release` isn't a real dependency anyone imports, there's no strict semver contract to honor — but a consistent convention still makes the changelog meaningful:

- **patch** — a fix: a broken solution, a typo, a corrected test, a dependency bump
- **minor** — an addition: a new exercise, a new doc, new tooling (this is what most changesets here will be)
- **major** — a breaking change to something people rely on across sessions: renaming/removing an exercise, a `data-testid` contract change, restructuring `packages/` or `solutions/`

## Why not just hand-edit CHANGELOG.md?

That's what this repo did initially (see `[1.0.0]` in `meta/release/CHANGELOG.md`, written by hand). The problem: it doesn't scale past a solo maintainer's memory of "what did I change since the last entry" — a changeset is written *at the time of the change*, next to the PR that makes it, so nothing gets forgotten or reconstructed after the fact. The tradeoff is real too: changeset summaries read more mechanically than curated prose. For this repo, automation won.
