# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to version the repository and generate a changelog.

Only `@practice/release` (`meta/release/`) is versioned — every `packages/*` and `solutions/*` exercise, and `@practice/exercise-shell`, are ignored (see `.changeset/config.json`). `@practice/release` holds no code; it exists purely as a version + changelog anchor for the repo as a whole, because Changesets cannot version a pnpm workspace's root package directly. See `docs/RELEASING.md` for the full process, or the quick version:

```bash
pnpm changeset   # describe your change, writes a file into .changeset/
```

Commit that file with your PR. Not every PR needs one — a typo fix or an internal refactor with no user-visible effect can skip it.
