import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import QRCode from 'qrcode'
import config from '@payload-config'
import { encryptSecret, generateTotpSecret } from '@/lib/totp'

export async function POST(req: Request) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { base32, uri } = generateTotpSecret(user.email ?? String(user.id))
    const qrDataUrl = await QRCode.toDataURL(uri)

    // Persisted immediately (encrypted), but twoFactorEnabled stays false until /confirm
    // verifies the user actually scanned it and can produce a valid code.
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { twoFactorSecret: encryptSecret(base32) },
      overrideAccess: true,
    })

    return NextResponse.json({ qrDataUrl, secret: base32 })
  } catch (err) {
    console.error('[2fa/setup] failed:', err)
    return NextResponse.json({ error: 'Failed to start setup' }, { status: 500 })
  }
}
