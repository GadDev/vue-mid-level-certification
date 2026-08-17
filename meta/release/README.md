# @practice/release

Not a real package — it ships no code and is never installed anywhere. It exists only so Changesets has a workspace package to version, since Changesets cannot version a pnpm workspace's root package directly (its release-plan step drops the root unconditionally, regardless of workspace config).

Its `version` field and `CHANGELOG.md` represent the repository as a whole: every exercise, doc, and tooling change worth calling out, not this specific folder. See [../../docs/RELEASING.md](../../docs/RELEASING.md) for the full release process.
