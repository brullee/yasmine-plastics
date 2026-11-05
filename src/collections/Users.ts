import { after } from 'next/server'
import { APIError, type CollectionConfig } from 'payload'
import { parseCookies } from 'payload/shared'
import { forgotPasswordEmailHtml, newDeviceSignInEmailHtml } from '@/lib/emailTemplates'
import { MAIL_FROM_NOREPLY, sendMail } from '@/lib/mailer'
import { getIP, loginRateLimit, newDeviceAlertRateLimit } from '@/lib/ratelimit'
import { TRUST_COOKIE_NAME, verifyToken, verifyTotpCode } from '@/lib/totp'

// Never throws: a failed alert email must not fail the login.
async function notifyNewDevice({ to, ip, userAgent }: { to: string; ip: string; userAgent: string }) {
  try {
    await sendMail({
      to,
      from: MAIL_FROM_NOREPLY,
      subject: 'New sign-in attempt on your Yasmine Plastics account',
      html: newDeviceSignInEmailHtml({ userEmail: to, ip, userAgent, time: new Date().toUTCString() }),
      text: `The correct password for ${to} was just used to sign in to the Yasmine Plastics admin panel from a device we haven't seen before. A two-factor code is being requested before access is granted.\n\nIP Address: ${ip}\nDevice: ${userAgent}\nTime (UTC): ${new Date().toUTCString()}\n\nIf this was you, no action is needed. If you don't recognize this activity, change your password and make sure to keep two-factor authentication enabled.`,
    })
  } catch (err) {
    console.error('[2fa] new-device alert email failed:', err)
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // The only guard against password guessing: beforeLogin runs after a correct password.
    maxLoginAttempts: 5,
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token ?? ''
        const user = args?.user
        const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
        const resetURL = `${serverURL}/admin/reset/${token}`
        return forgotPasswordEmailHtml({ resetURL, userEmail: String((user as { email?: string }).email ?? '') })
      },
    },
  },
  hooks: {
    beforeLogin: [
      async ({ req, user }) => {
        const ip = getIP(req.headers)

        // Only wrong codes count toward the rate limit. APIError, not Error, so these return a 4xx, not a 500.
        const fail = async (message: string): Promise<never> => {
          let limited = false
          try {
            const { success } = await loginRateLimit.limit(ip)
            limited = !success
          } catch (err) {
            console.error('[beforeLogin] rate-limit check failed:', err)
          }
          if (limited) throw new APIError('Too many login attempts. Please try again later.', 429)
          throw new APIError(message, 401)
        }

        const u = user as Record<string, unknown>
        if (!u.twoFactorEnabled) return

        // "Remember this device": skip the code prompt while the trust cookie is valid.
        const trustToken = parseCookies(req.headers).get(TRUST_COOKIE_NAME)
        const trustedDevices = (u.twoFactorTrustedDevices ?? []) as { hash: string; expiresAt: string }[]
        const isTrustedDevice = !!trustToken && trustedDevices.some(
          (d) => new Date(d.expiresAt).getTime() > Date.now() && verifyToken(trustToken, d.hash)
        )
        if (isTrustedDevice) return

        // Lowercased because recovery codes are lowercase hex and mobile keyboards auto-capitalize.
        const code = ((req.data as Record<string, unknown> | undefined)?.twoFactorCode as string | undefined)?.toLowerCase()
        if (!code) {
          // Correct password from an unknown device: alert the owner, at most once per 15 min.
          const userAgent = req.headers.get('user-agent') ?? 'unknown'
          after(async () => {
            try {
              const { success } = await newDeviceAlertRateLimit.limit(u.id as string)
              if (success) await notifyNewDevice({ to: u.email as string, ip, userAgent })
            } catch (err) {
              console.error('[2fa] new-device alert rate-limit check failed:', err)
            }
          })
          throw new APIError('Two-factor code required', 401)
        }

        const encryptedSecret = u.twoFactorSecret as string | undefined
        const lastUsedStep = (u.twoFactorLastUsedStep ?? null) as number | null
        const matchedStep = encryptedSecret ? verifyTotpCode(encryptedSecret, code, lastUsedStep) : null
        if (matchedStep !== null) {
          // Stops the same code being replayed.
          await req.payload.update({
            req,
            collection: 'users',
            id: u.id as string,
            data: { twoFactorLastUsedStep: matchedStep },
            overrideAccess: true,
          })
          return
        }

        const recoveryCodes = (u.twoFactorRecoveryCodes ?? []) as { hash: string; id?: string }[]
        const matchIndex = recoveryCodes.findIndex((r) => verifyToken(code, r.hash))
        if (matchIndex === -1) await fail('Invalid two-factor code')

        const remaining = recoveryCodes.filter((_, i) => i !== matchIndex)
        await req.payload.update({
          req,
          collection: 'users',
          id: u.id as string,
          data: { twoFactorRecoveryCodes: remaining },
          overrideAccess: true,
        })
      },
    ],
  },
  admin: { useAsTitle: 'email' },
  fields: [
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      defaultValue: false,
      // TwoFactorSetup is the UI for this.
      admin: { readOnly: true, hidden: true, disableListColumn: true },
    },
    {
      name: 'twoFactorSecret',
      type: 'text',
      admin: { hidden: true, disableListColumn: true },
      access: { read: () => false },
    },
    {
      name: 'twoFactorRecoveryCodes',
      type: 'array',
      admin: { hidden: true, disableListColumn: true },
      access: { read: () => false },
      fields: [
        { name: 'hash', type: 'text' },
      ],
    },
    {
      name: 'twoFactorLastUsedStep',
      label: 'Two-Factor Last Used Step',
      type: 'number',
      // Replay protection, see src/lib/totp.ts.
      admin: { hidden: true, disableListColumn: true },
      access: { read: () => false },
    },
    {
      name: 'twoFactorTrustedDevices',
      label: 'Two-Factor Trusted Devices',
      type: 'array',
      // Cleared when 2FA is disabled.
      admin: { hidden: true, disableListColumn: true },
      access: { read: () => false },
      fields: [
        { name: 'hash', type: 'text' },
        { name: 'expiresAt', type: 'date' },
      ],
    },
    {
      name: 'twoFactorSetup',
      label: 'Two-Factor Authentication',
      type: 'ui',
      admin: {
        disableListColumn: true,
        components: {
          Field: '@/components/payload/TwoFactorSetup#TwoFactorSetup',
        },
      },
    },
  ],
}
