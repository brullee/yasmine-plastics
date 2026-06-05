import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const handleI18nRouting = createMiddleware(routing)

export default function middleware(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })

  const pathname = req.nextUrl.pathname
  const hasLocalePrefix = routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  // When no locale is in the URL, honour the user's saved preference before
  // falling back to the hardcoded defaultLocale ('ar').
  if (!hasLocalePrefix) {
    const saved = req.cookies.get('NEXT_LOCALE')?.value
    if (saved && (routing.locales as readonly string[]).includes(saved)) {
      const url = req.nextUrl.clone()
      url.pathname = `/${saved}${pathname === '/' ? '' : pathname}`
      return NextResponse.redirect(url)
    }
  }

  return handleI18nRouting(req)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
