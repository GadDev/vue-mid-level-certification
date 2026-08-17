---
name: Bug report
about: Something is wrong in a solution, a spec, the docs, or the tooling
title: ""
labels: bug
---

**Where**
- [ ] `solutions/<exercise>` — a reference implementation doesn't pass its own spec
- [ ] `packages/<exercise>` — a spec seems wrong, or a starter doesn't build/typecheck
- [ ] `shared/exercise-shell`
- [ ] docs (`README.md`, `docs/*.md`)
- [ ] tooling (`pnpm` scripts, CI, Biome, `sync-tests.sh`)

**What's wrong**
A clear description of the bug. For a test/spec issue, include the failing assertion and why you think it's wrong rather than just "it fails."

**Steps to reproduce**
```bash
pnpm --filter <exercise> test
```

**Expected vs. actual**

**Environment**
- Node version:
- pnpm version:
- OS:
