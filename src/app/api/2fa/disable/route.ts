import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { verifyRecoveryCode, verifyTotpCode } from '@/lib/totp'

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

    const validTotp = !!encryptedSecret && verifyTotpCode(encryptedSecret, code)
    const validRecovery = recoveryCodes.some((r) => verifyRecoveryCode(code, r.hash))

    if (!validTotp && !validRecovery)
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorRecoveryCodes: [] },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[2fa/disable] failed:', err)
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}
