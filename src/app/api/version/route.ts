import { NextResponse } from 'next/server'
import { version } from '../../../../package.json'

// Answers "which code is live right now?" without digging through Vercel's dashboard -
// the package.json version (bumped by npm version) plus the exact commit Vercel built.
// Both are fixed per deployment, so this is rendered once at build time.
export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json({
    version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    env: process.env.VERCEL_ENV ?? 'local',
  })
}
