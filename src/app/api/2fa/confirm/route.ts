import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateRecoveryCodes, hashToken, verifyTotpCode } from '@/lib/totp'
import { getIP, loginRateLimit } from '@/lib/ratelimit'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { code: rawCode } = await req.json()
    if (!rawCode || typeof rawCode !== 'string') return NextResponse.json({ error: 'Code required' }, { status: 400 })
    const code = rawCode.toLowerCase()

    const { success } = await loginRateLimit.limit(getIP(req)).catch(() => ({ success: true }))
    if (!success) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })

    const fullUser = await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true })
    // Only meant for the just-scanned-QR setup flow, which runs before twoFactorEnabled
    // is ever set true (see /api/2fa/setup) — calling this again afterwards would let a
    // session replay a code already spent at login to silently regenerate recovery codes
    // and clear every trusted device.
    if ((fullUser as Record<string, unknown>).twoFactorEnabled) {
      return NextResponse.json({ error: 'Two-factor authentication is already enabled' }, { status: 400 })
    }
    const encryptedSecret = (fullUser as Record<string, unknown>).twoFactorSecret as string | undefined
    if (!encryptedSecret) return NextResponse.json({ error: 'Setup not started' }, { status: 400 })

    const lastUsedStep = ((fullUser as Record<string, unknown>).twoFactorLastUsedStep ?? null) as number | null
    const matchedStep = verifyTotpCode(encryptedSecret, code, lastUsedStep)
    if (matchedStep === null)
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    const recoveryCodes = generateRecoveryCodes()
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: recoveryCodes.map((c) => ({ hash: hashToken(c) })),
        // Record the setup-confirmation code's step so it can't immediately be replayed
        // to log in again with the same code.
        twoFactorLastUsedStep: matchedStep,
        // /api/2fa/trust-device only requires an authenticated session, not
        // twoFactorEnabled, so a trust entry could in principle be written before 2FA is
        // turned on. Wipe the array here so enabling 2FA always starts from zero trust,
        // symmetric with /api/2fa/disable clearing it when 2FA is torn down.
        twoFactorTrustedDevices: [],
      },
      overrideAccess: true,
    })

    return NextResponse.json({ recoveryCodes })
  } catch (err) {
    console.error('[2fa/confirm] failed:', err)
    return NextResponse.json({ error: 'Failed to confirm setup' }, { status: 500 })
  }
}
