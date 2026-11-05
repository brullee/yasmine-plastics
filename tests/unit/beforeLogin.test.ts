import { randomBytes } from 'crypto'
import { Secret, TOTP } from 'otpauth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  afterCallbacks: [] as (() => Promise<void>)[],
  loginLimit: vi.fn(),
  alertLimit: vi.fn(),
  sendMail: vi.fn(),
}))

vi.mock('next/server', () => ({
  after: (fn: () => Promise<void>) => { mocks.afterCallbacks.push(fn) },
}))
vi.mock('@/lib/ratelimit', () => ({
  getIP: (h: Headers) => h.get('x-forwarded-for') ?? 'unknown',
  loginRateLimit: { limit: mocks.loginLimit },
  newDeviceAlertRateLimit: { limit: mocks.alertLimit },
}))
vi.mock('@/lib/mailer', () => ({
  sendMail: mocks.sendMail,
  MAIL_FROM_NOREPLY: 'noreply@test',
}))

const { Users } = await import('@/collections/Users')
const { encryptSecret, hashToken, TRUST_COOKIE_NAME } = await import('@/lib/totp')

const beforeLogin = Users.hooks!.beforeLogin![0] as (args: unknown) => Promise<unknown>

const NOW = new Date('2026-11-05T12:00:10Z').getTime()
const base32 = new Secret({ size: 20 }).base32
const totp = new TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(base32) })
const currentStep = Math.floor(NOW / 1000 / 30)

type Opts = { code?: string; cookie?: string; user?: Record<string, unknown> }

function login({ code, cookie, user = {} }: Opts = {}) {
  const update = vi.fn()
  const headers = new Headers({ 'x-forwarded-for': '203.0.113.7', 'user-agent': 'TestAgent' })
  if (cookie) headers.set('cookie', cookie)
  const fullUser = {
    id: 'u1',
    email: 'admin@example.com',
    twoFactorEnabled: true,
    twoFactorSecret: encryptSecret(base32),
    twoFactorRecoveryCodes: [{ hash: hashToken('aaaaaaaaaa') }, { hash: hashToken('bbbbbbbbbb') }],
    ...user,
  }
  const req = { headers, data: code === undefined ? {} : { twoFactorCode: code }, payload: { update } }
  return { run: () => beforeLogin({ req, user: fullUser }), update }
}

async function rejection(p: () => Promise<unknown>) {
  try {
    await p()
  } catch (err) {
    return err as { message: string; status: number }
  }
  throw new Error('expected the login to be rejected')
}

beforeEach(() => {
  vi.stubEnv('TOTP_ENCRYPTION_KEY', randomBytes(32).toString('base64'))
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  mocks.afterCallbacks.length = 0
  mocks.loginLimit.mockReset().mockResolvedValue({ success: true })
  mocks.alertLimit.mockReset().mockResolvedValue({ success: true })
  mocks.sendMail.mockReset().mockResolvedValue({})
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('without 2FA', () => {
  it('lets the login through untouched', async () => {
    const { run, update } = login({ user: { twoFactorEnabled: false } })
    await expect(run()).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })
})

describe('code required step', () => {
  it('rejects with 401 when no code is sent', async () => {
    const err = await rejection(login().run)
    expect(err.status).toBe(401)
    expect(err.message).toBe('Two-factor code required')
  })

  it('does not count against the login rate limit', async () => {
    await rejection(login().run)
    expect(mocks.loginLimit).not.toHaveBeenCalled()
  })

  it('emails the owner about the unknown device', async () => {
    await rejection(login().run)
    expect(mocks.afterCallbacks).toHaveLength(1)
    await mocks.afterCallbacks[0]()
    expect(mocks.alertLimit).toHaveBeenCalledWith('u1')
    expect(mocks.sendMail).toHaveBeenCalledOnce()
    const mail = mocks.sendMail.mock.calls[0][0]
    expect(mail.to).toBe('admin@example.com')
    expect(mail.text).toContain('203.0.113.7')
    expect(mail.text).toContain('TestAgent')
  })

  it('caps the alert email with its own rate limit', async () => {
    mocks.alertLimit.mockResolvedValue({ success: false })
    await rejection(login().run)
    await mocks.afterCallbacks[0]()
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it('swallows alert failures so they never break the login response', async () => {
    mocks.alertLimit.mockRejectedValue(new Error('upstash down'))
    await rejection(login().run)
    await expect(mocks.afterCallbacks[0]()).resolves.toBeUndefined()

    mocks.alertLimit.mockResolvedValue({ success: true })
    mocks.sendMail.mockRejectedValue(new Error('resend down'))
    await rejection(login().run)
    await expect(mocks.afterCallbacks[1]()).resolves.toBeUndefined()
  })
})

describe('trusted device', () => {
  const token = 'f'.repeat(64)
  const device = (expiresAt: number) => ({ hash: hashToken(token), expiresAt: new Date(expiresAt).toISOString() })

  it('skips the code prompt with a valid trust cookie', async () => {
    const { run } = login({
      cookie: `${TRUST_COOKIE_NAME}=${token}`,
      user: { twoFactorTrustedDevices: [device(NOW + 86_400_000)] },
    })
    await expect(run()).resolves.toBeUndefined()
  })

  it('asks for a code when the trust has expired', async () => {
    const { run } = login({
      cookie: `${TRUST_COOKIE_NAME}=${token}`,
      user: { twoFactorTrustedDevices: [device(NOW - 1)] },
    })
    expect((await rejection(run)).message).toBe('Two-factor code required')
  })

  it('asks for a code when the cookie does not match a stored device', async () => {
    const { run } = login({
      cookie: `${TRUST_COOKIE_NAME}=${'0'.repeat(64)}`,
      user: { twoFactorTrustedDevices: [device(NOW + 86_400_000)] },
    })
    expect((await rejection(run)).message).toBe('Two-factor code required')
  })

  it('asks for a code when the account has no trusted devices', async () => {
    const { run } = login({ cookie: `${TRUST_COOKIE_NAME}=${token}`, user: { twoFactorTrustedDevices: [] } })
    expect((await rejection(run)).message).toBe('Two-factor code required')
  })
})

describe('authenticator code', () => {
  it('accepts the current code and records its step', async () => {
    const { run, update } = login({ code: totp.generate({ timestamp: NOW }) })
    await expect(run()).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'users',
      id: 'u1',
      data: { twoFactorLastUsedStep: currentStep },
    }))
  })

  it('rejects a replayed code', async () => {
    const { run, update } = login({
      code: totp.generate({ timestamp: NOW }),
      user: { twoFactorLastUsedStep: currentStep },
    })
    const err = await rejection(run)
    expect(err.status).toBe(401)
    expect(err.message).toBe('Invalid two-factor code')
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a wrong code and counts it toward the rate limit', async () => {
    const { run } = login({ code: 'zzzzzz' })
    const err = await rejection(run)
    expect(err.status).toBe(401)
    expect(mocks.loginLimit).toHaveBeenCalledWith('203.0.113.7')
  })

  it('returns 429 once the rate limit is used up', async () => {
    mocks.loginLimit.mockResolvedValue({ success: false })
    const err = await rejection(login({ code: 'zzzzzz' }).run)
    expect(err.status).toBe(429)
  })

  it('still returns a clean 401 when Upstash is down', async () => {
    mocks.loginLimit.mockRejectedValue(new Error('upstash down'))
    const err = await rejection(login({ code: 'zzzzzz' }).run)
    expect(err.status).toBe(401)
  })
})

describe('recovery code', () => {
  it('accepts a recovery code and removes it so it cannot be reused', async () => {
    const { run, update } = login({ code: 'aaaaaaaaaa' })
    await expect(run()).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: { twoFactorRecoveryCodes: [{ hash: hashToken('bbbbbbbbbb') }] },
    }))
  })

  it('accepts a recovery code typed in uppercase', async () => {
    await expect(login({ code: 'AAAAAAAAAA' }).run()).resolves.toBeUndefined()
  })

  it('rejects a recovery code that was already used', async () => {
    const { run } = login({ code: 'aaaaaaaaaa', user: { twoFactorRecoveryCodes: [{ hash: hashToken('bbbbbbbbbb') }] } })
    expect((await rejection(run)).status).toBe(401)
  })

  it('rejects any code when there is no secret and no recovery codes', async () => {
    const { run } = login({ code: '123456', user: { twoFactorSecret: undefined, twoFactorRecoveryCodes: [] } })
    expect((await rejection(run)).status).toBe(401)
  })
})
