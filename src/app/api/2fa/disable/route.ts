import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyToken, verifyTotpCode } from '@/lib/totp'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    const fullUser = await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true })
    const encryptedSecret = (fullUser as Record<string, unknown>).twoFactorSecret as string | undefined
    const recoveryCodes = ((fullUser as Record<string, unknown>).twoFactorRecoveryCodes ?? []) as { hash: string }[]
    const lastUsedStep = ((fullUser as Record<string, unknown>).twoFactorLastUsedStep ?? null) as number | null

    // Reusing the last time-step accepted at login (or a prior disable attempt) is
    // rejected here just like it would be on a second login — otherwise a single
    // captured code could log an attacker in AND immediately disable 2FA on the account.
    // A fresh code (next ~30s time-step) or a recovery code is required.
    const validTotp = !!encryptedSecret && verifyTotpCode(encryptedSecret, code, lastUsedStep) !== null
    const validRecovery = recoveryCodes.some((r) => verifyToken(code, r.hash))

    if (!validTotp && !validRecovery)
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: [],
        twoFactorLastUsedStep: null,
        // Trust only ever means "skip the code prompt for this 2FA setup" — stale once
        // 2FA itself is torn down, and re-enabling later should start from zero trust.
        twoFactorTrustedDevices: [],
      },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[2fa/disable] failed:', err)
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}
