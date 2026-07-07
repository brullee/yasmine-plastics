import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { generateRecoveryCodes, hashRecoveryCode, verifyTotpCode } from '@/lib/totp'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const fullUser = await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true })
    const encryptedSecret = (fullUser as Record<string, unknown>).twoFactorSecret as string | undefined
    if (!encryptedSecret) return NextResponse.json({ error: 'Setup not started' }, { status: 400 })

    const matchedStep = verifyTotpCode(encryptedSecret, code)
    if (matchedStep === null)
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    const recoveryCodes = generateRecoveryCodes()
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: recoveryCodes.map((c) => ({ hash: hashRecoveryCode(c) })),
        // Record the setup-confirmation code's step so it can't immediately be replayed
        // to log in again with the same code.
        twoFactorLastUsedStep: matchedStep,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ recoveryCodes })
  } catch (err) {
    console.error('[2fa/confirm] failed:', err)
    return NextResponse.json({ error: 'Failed to confirm setup' }, { status: 500 })
  }
}
