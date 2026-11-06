# Yasmine Plastics

Product catalog site for a plastics manufacturer (Arabic default, English under `/en`), with a Payload CMS admin at `/admin`. Next.js 16 + Payload 3 on Vercel, Neon Postgres, Upstash Redis, media on Cloudflare R2.

## Databases - read first
- `.env.local` points at the Neon `dev` branch, CI at `ci`; only Vercel uses `production`.
- No migrations: dev mode pushes schema to whichever branch it uses, and Vercel builds never push, so schema changes reach production only when applied on purpose.
- Failed logins count toward Payload's lockout (5 attempts, 10 min). Never try passwords against a real admin account.

## Workflow
- Work on `dev`, open a PR to `main`; Vercel deploys only `main`. After a merge, `npm run sync` fast-forwards `dev` to `main`.
- Version with `npm version patch|minor|major` (it commits and tags). The live version and commit are at `/api/version`.

## Commands
- `npm run check` - type-check + lint. Before calling a code change done, use the `verify` skill (check + e2e + no weakened tests).
- `npm test` - Vitest unit tests in `tests/unit/` (security logic: 2FA, login hook, forms, proxy). They mock Payload, Upstash and email, so they never touch production.
- `npm run test:e2e` - Playwright against its own `next dev` on port 3901, separate `.next-e2e` dir. Forms are mocked with `page.route` so tests never send email or use up rate limits; do the same in new form tests.
- `npm run dev` deletes `.next` first, which briefly breaks the editor's TypeScript types until it rebuilds.

## Gotchas
- This Next.js is newer than your training data. Read the relevant guide in `node_modules/next/dist/docs/` before an uncertain App Router or `proxy.ts` call.
- `payload.config.ts` can't be loaded by a standalone script (`npx payload run` fails on its `next/server` import). Test through the running dev server instead.
- The admin login page only renders when logged out - an everyday logged-in session never shows it, so check it explicitly after touching auth.
- Rate limits (`src/lib/ratelimit.ts`) fail open when Upstash is unreachable; CI has no Upstash credentials and logs warnings about it, which is expected.
- Comments are 1-2 short lines, only where the code can't explain itself; no em or en dashes anywhere. `.claude/hooks/comment-style.mjs` enforces both.
