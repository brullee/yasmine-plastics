import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const slug       = req.nextUrl.searchParams.get('slug') ?? ''
  const collection = req.nextUrl.searchParams.get('collection') ?? 'products'

  try {
    const payload  = await getPayload({ config })
    const { docs } = await payload.find({
      collection: collection as 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })

    if (docs[0]) {
      return NextResponse.redirect(
        new URL(`/admin/collections/${collection}/${docs[0].id}`, 'https://www.yasmineplastics.com')
      )
    }
  } catch { /* fall through */ }

  return NextResponse.redirect(new URL('/admin', 'https://www.yasmineplastics.com'))
}
