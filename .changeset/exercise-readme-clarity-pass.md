---
"@practice/release": patch
---

Add a `## What you're building` section to every exercise README (01–31) — a short,
product-facing sentence framing the exercise's end-user behavior before the technical
prompt, with no new implementation hints. Also tightened 12, 13, and 14: removed
`Hidden edge cases` entries that duplicated the stated Requirements, moved each
exercise's key design trap into its own `## Traps` heading instead of trailing after
`## Run`, and spelled out the props' data shape inline instead of requiring a trip to
`src/data/*.ts`. Updated `CLAUDE.md`: `docs/ANTI_PATTERNS.md` now covers all six
batches (AP-1…AP-18), not just batches 1–2, and noted that `31-panel-forwarding` exists
but isn't fully wired up yet (no `dev:31` script, no root `README.md`/`LEARNING_PATH.md`
row, no `PATTERNS.md` entry).
