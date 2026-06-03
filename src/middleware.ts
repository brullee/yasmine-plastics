import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'

const handleI18nRouting = createMiddleware(routing)

export default function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  return handleI18nRouting(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
