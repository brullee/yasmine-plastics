---
name: verify
description: Run this project's gates (type-check, lint, Playwright e2e) and check no test was weakened, before calling a code change done. Use after editing anything under src/, e2e/, payload.config.ts or next.config.ts, and before suggesting a commit.
---

Run `.claude/skills/verify/check.sh` from the repo root. It runs, in order:

1. `npm run check` - type-check + lint.
2. `npx playwright test --workers=1` - the full e2e suite on its own dev server (port 3901, `.next-e2e`), one worker like CI. About a minute once the server is warm.
3. A diff of `e2e/` against the branch point with `main`, flagging removed assertions or tests and any new `.skip`/`.only`/`.fixme`.

Pass `--quick` to skip step 2 when the change can't affect rendered pages (docs, CI config, `.claude/`, scripts).

Report each step's actual result from the output - never summarize as "looks good". If step 3 flags anything, say which assertion or test changed and why that change is correct; a test loosened just to make it pass is a failure, not a fix.

The e2e run reads the production database (see `CLAUDE.md`) but writes nothing - forms are mocked. Don't add a test that writes data.
