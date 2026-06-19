import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''

  if (host === 'admin.yasmineplastics.com') {
    const url = request.nextUrl.clone()
    const path = request.nextUrl.pathname
    url.pathname = path === '/' ? '/admin' : `/admin${path}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
