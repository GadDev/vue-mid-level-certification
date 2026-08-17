## What does this change

## Checklist

- [ ] I did not edit any `packages/*/tests/*.spec.ts` (the tests are the spec — open an issue instead if one looks wrong)
- [ ] I did not copy anything from `solutions/` into `packages/`
- [ ] If I touched a spec, I ran `pnpm sync:tests` and committed the regenerated `solutions/*/tests/` copy
- [ ] `pnpm check` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test:solutions` is green
- [ ] `pnpm build` succeeds
- [ ] `pnpm docs:build` succeeds (if you touched `docs/`)
- [ ] If this adds a new exercise: `docs/LEARNING_PATH.md`, `docs/PATTERNS.md`, the root `README.md` table, and a `dev:NN` script in `package.json` are all updated
- [ ] I ran `pnpm changeset` if this change is user-facing (see `docs/RELEASING.md`)
