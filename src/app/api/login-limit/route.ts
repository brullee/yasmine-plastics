import { NextRequest, NextResponse } from 'next/server'
import { loginRateLimit, getIP } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const { remaining, reset } = await loginRateLimit.getRemaining(getIP(req))
  return NextResponse.json({ remaining, reset })
}
