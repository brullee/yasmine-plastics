import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { generateCookie } from 'payload/shared'
import config from '@payload-config'
import { generateTrustToken, hashToken, TRUST_COOKIE_NAME, TRUST_DEVICE_DAYS } from '@/lib/totp'

// Called by the login form (src/components/payload/LoginViewForm.tsx) right after a
// successful 2FA login, so this device can skip the code prompt next time — see the
// beforeLogin hook in payload.config.ts for the other half of this flow.
export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const fullUser = await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true })
    const existing = ((fullUser as Record<string, unknown>).twoFactorTrustedDevices ?? []) as { hash: string; expiresAt: string }[]
    // Drop anything already expired so this array doesn't grow forever.
    const stillValid = existing.filter((d) => new Date(d.expiresAt).getTime() > Date.now())

    const token = generateTrustToken()
    const expiresAt = new Date(Date.now() + TRUST_DEVICE_DAYS * 24 * 60 * 60 * 1000)

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { twoFactorTrustedDevices: [...stillValid, { hash: hashToken(token), expiresAt: expiresAt.toISOString() }] },
      overrideAccess: true,
    })

    const cookie = generateCookie<false>({
      name: TRUST_COOKIE_NAME,
      value: token,
      httpOnly: true,
      // NODE_ENV, not VERCEL_ENV: Next.js sets NODE_ENV=production for every deployed
      // build (preview or production), so this tracks "is this actually served over
      // HTTPS" — VERCEL_ENV distinguishes preview vs. production, a different axis, and
      // would leave Secure off on every preview deploy.
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/api/users/login',
      expires: expiresAt,
      returnCookieAsObject: false,
    })

    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', cookie)
    return res
  } catch (err) {
    console.error('[2fa/trust-device] failed:', err)
    return NextResponse.json({ error: 'Failed to remember device' }, { status: 500 })
  }
}
