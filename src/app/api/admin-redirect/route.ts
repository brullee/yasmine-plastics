import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Only caller is the admin-subdomain product-link redirect in src/proxy.ts, which only
// ever passes collection=products — hardcoded here (rather than accepted as a query
// param) so this stays a fixed, single-purpose lookup instead of an open, unauthenticated
// query against any collection (Payload's Local API bypasses access control by default).
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? ''

  try {
    const payload  = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    if (docs[0]) {
      return NextResponse.redirect(
        new URL(`/admin/collections/products/${docs[0].id}`, 'https://www.yasmineplastics.com')
      )
    }
  } catch (err) {
    console.error('[admin-redirect] lookup failed:', err)
  }

  return NextResponse.redirect(new URL('/admin', 'https://www.yasmineplastics.com'))
}
