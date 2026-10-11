---
name: check-live
description: Check what's deployed on the live site and whether it's healthy, or whether a given fix/commit has reached production yet. Use when the user asks "is it live", "did the deploy work", "is the site up", or after a merge to main.
---

1. Run `scripts/health-check.sh` (production by default; pass a URL for a preview or `http://localhost:3000`). It prints the live `/api/version` (version + commit) and checks that `/`, `/en/products` and `/admin/login` really render, not just return 200. The daily GitHub workflow runs this same script.
2. To answer "is commit X live?", take the `commit` from the output and run `git fetch origin` then `git merge-base --is-ancestor <X> <live-commit>` - exit 0 means X is deployed. If `live:` says `version unavailable`, the deployed build predates `/api/version` (added in 1.1.12); fall back to comparing with `git log origin/main`.
3. Report the live version/commit and each page's ok/error line. For any error, say which page and marker failed - a missing marker means the page rendered without that part (e.g. the login view crashed), not that the site is down.

Never "fix" a failing check by editing the markers in the script; find out why the page stopped rendering them.
