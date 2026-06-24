import createMiddleware from 'next-intl/middleware'
// TODO: update to next-intl/proxy once next-intl officially supports Next.js 16
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { loginRateLimit } from './lib/ratelimit'

const handleI18nRouting = createMiddleware(routing)

export default async function proxy(req: NextRequest) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })

  const host = req.headers.get('host') ?? ''

  const authPaths = ['/api/users/login', '/api/users/forgot-password']
  if (authPaths.includes(req.nextUrl.pathname)) {
    if (req.method === 'POST') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
      const { success } = await loginRateLimit.limit(ip)
      if (!success) return NextResponse.json({ errors: [{ message: 'Too many attempts. Try again later.' }] }, { status: 429 })
    }
    return NextResponse.next()
  }

  if (host === 'admin.yasmineplastics.com') {
    const path = req.nextUrl.pathname.replace(/^\/(ar|en)(\/|$)/, '/') || '/'
    const productMatch = path.match(/^\/products\/([^/]+)\/?$/)
    if (productMatch) {
      const url = req.nextUrl.clone()
      url.pathname = '/api/admin-redirect'
      url.search   = `?collection=products&slug=${productMatch[1]}`
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const pathname = req.nextUrl.pathname
  const saved = req.cookies.get('NEXT_LOCALE')?.value
  const validLocales = routing.locales as readonly string[]

  if (saved && validLocales.includes(saved)) {
    const urlLocale = routing.locales.find(
      (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    )

    if (!urlLocale) {
      // No locale prefix - redirect to saved preference (existing behaviour)
      const url = req.nextUrl.clone()
      url.pathname = `/${saved}${pathname === '/' ? '' : pathname}`
      return NextResponse.redirect(url)
    }

    if (urlLocale !== saved) {
      // URL has a different locale than the saved preference (e.g. back button hit
      // an old /en/ URL after the user switched to Arabic) - redirect to match preference
      const url = req.nextUrl.clone()
      url.pathname = `/${saved}${pathname.slice(`/${urlLocale}`.length) || '/'}`
      return NextResponse.redirect(url)
    }
  }

  return handleI18nRouting(req)
}

export const config = {
  matcher: [
    '/((?!admin|api|_next|_vercel|.*\\..*).*)',
    '/api/users/login',
    '/api/users/forgot-password',
  ],
}
