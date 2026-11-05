import { randomBytes } from 'crypto'
import { Secret, TOTP } from 'otpauth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
  authed: true,
  update: vi.fn(),
  loginLimit: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: async () => ({
    auth: async () => ({ user: mocks.authed ? { id: 'u1', email: 'admin@example.com' } : null }),
    findByID: async () => mocks.user,
    update: mocks.update,
  }),
}))
vi.mock('@/lib/ratelimit', () => ({
  getIP: () => '203.0.113.7',
  loginRateLimit: { limit: mocks.loginLimit },
}))

const setup = await import('@/app/api/2fa/setup/route')
const confirm = await import('@/app/api/2fa/confirm/route')
const disable = await import('@/app/api/2fa/disable/route')
const trust = await import('@/app/api/2fa/trust-device/route')
const { decryptSecret, encryptSecret, hashToken, verifyToken, TRUST_COOKIE_NAME } = await import('@/lib/totp')

const NOW = new Date('2026-11-05T12:00:10Z').getTime()
const STEP = Math.floor(NOW / 1000 / 30)
const base32 = new Secret({ size: 20 }).base32
const code = () => new TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(base32) }).generate({ timestamp: NOW })

const call = (route: { POST: (r: Request) => Promise<Response> }, body?: object) =>
  route.POST(new Request('https://example.com', { method: 'POST', body: body ? JSON.stringify(body) : undefined }))
const updateData = () => mocks.update.mock.calls[0][0].data

beforeEach(() => {
  vi.stubEnv('TOTP_ENCRYPTION_KEY', randomBytes(32).toString('base64'))
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  mocks.authed = true
  mocks.user = { id: 'u1', twoFactorEnabled: false }
  mocks.update.mockReset().mockResolvedValue({})
  mocks.loginLimit.mockReset().mockResolvedValue({ success: true })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe.each([
  ['setup', setup],
  ['confirm', confirm],
  ['disable', disable],
  ['trust-device', trust],
])('%s requires a session', (_name, route) => {
  it('returns 401 when logged out, without touching the user', async () => {
    mocks.authed = false
    expect((await call(route, { code: '123456' })).status).toBe(401)
    expect(mocks.update).not.toHaveBeenCalled()
  })
})

describe('setup', () => {
  it('stores the new secret encrypted and leaves 2FA off until confirmed', async () => {
    const res = await call(setup)
    expect(res.status).toBe(200)
    const { secret, qrDataUrl } = await res.json()
    expect(qrDataUrl).toMatch(/^data:image\/png;base64,/)
    const stored = updateData().twoFactorSecret
    expect(stored).not.toContain(secret)
    expect(decryptSecret(stored)).toBe(secret)
    expect(updateData()).not.toHaveProperty('twoFactorEnabled')
  })

  it('refuses to overwrite the secret while 2FA is on', async () => {
    mocks.user = { id: 'u1', twoFactorEnabled: true }
    expect((await call(setup)).status).toBe(400)
    expect(mocks.update).not.toHaveBeenCalled()
  })
})

describe('confirm', () => {
  beforeEach(() => {
    mocks.user = { id: 'u1', twoFactorEnabled: false, twoFactorSecret: encryptSecret(base32) }
  })

  it('enables 2FA, stores only hashed recovery codes and clears trusted devices', async () => {
    const res = await call(confirm, { code: code() })
    expect(res.status).toBe(200)
    const { recoveryCodes } = await res.json()
    expect(recoveryCodes).toHaveLength(10)
    const data = updateData()
    expect(data.twoFactorEnabled).toBe(true)
    expect(data.twoFactorLastUsedStep).toBe(STEP)
    expect(data.twoFactorTrustedDevices).toEqual([])
    expect(JSON.stringify(data)).not.toContain(recoveryCodes[0])
    expect(verifyToken(recoveryCodes[0], data.twoFactorRecoveryCodes[0].hash)).toBe(true)
  })

  it('rejects a wrong code', async () => {
    expect((await call(confirm, { code: 'zzzzzz' })).status).toBe(400)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('rejects a missing or non-string code', async () => {
    expect((await call(confirm, {})).status).toBe(400)
    expect((await call(confirm, { code: 123456 })).status).toBe(400)
  })

  it('cannot be rerun once 2FA is on, so a session cannot regenerate recovery codes', async () => {
    mocks.user = { ...mocks.user, twoFactorEnabled: true }
    expect((await call(confirm, { code: code() })).status).toBe(400)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('needs setup to have started', async () => {
    mocks.user = { id: 'u1', twoFactorEnabled: false }
    expect((await call(confirm, { code: code() })).status).toBe(400)
  })

  it('is rate limited, and fails open if Upstash is down', async () => {
    mocks.loginLimit.mockResolvedValue({ success: false })
    expect((await call(confirm, { code: code() })).status).toBe(429)
    mocks.loginLimit.mockRejectedValue(new Error('upstash down'))
    expect((await call(confirm, { code: code() })).status).toBe(200)
  })
})

describe('disable', () => {
  beforeEach(() => {
    mocks.user = {
      id: 'u1',
      twoFactorEnabled: true,
      twoFactorSecret: encryptSecret(base32),
      twoFactorRecoveryCodes: [{ hash: hashToken('aaaaaaaaaa') }],
      twoFactorTrustedDevices: [{ hash: 'x', expiresAt: new Date(NOW + 1e9).toISOString() }],
    }
  })

  it('turns 2FA off and wipes every secret with a valid code', async () => {
    expect((await call(disable, { code: code() })).status).toBe(200)
    expect(updateData()).toEqual({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorRecoveryCodes: [],
      twoFactorLastUsedStep: null,
      twoFactorTrustedDevices: [],
    })
  })

  it('accepts a recovery code in any case', async () => {
    expect((await call(disable, { code: 'AAAAAAAAAA' })).status).toBe(200)
  })

  it('rejects the code that was just used to log in', async () => {
    mocks.user = { ...mocks.user, twoFactorLastUsedStep: STEP }
    expect((await call(disable, { code: code() })).status).toBe(400)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('rejects a wrong code', async () => {
    expect((await call(disable, { code: '000000x' })).status).toBe(400)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('is rate limited, so a hijacked session cannot brute-force codes', async () => {
    mocks.loginLimit.mockResolvedValue({ success: false })
    expect((await call(disable, { code: code() })).status).toBe(429)
    expect(mocks.update).not.toHaveBeenCalled()
  })
})

describe('trust-device', () => {
  it('sets an HttpOnly, path-scoped cookie and stores only its hash', async () => {
    const res = await call(trust)
    expect(res.status).toBe(200)
    const cookie = res.headers.get('set-cookie') ?? ''
    const token = cookie.match(new RegExp(`${TRUST_COOKIE_NAME}=([0-9a-f]{64})`))?.[1]
    expect(token).toBeDefined()
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=Lax/i)
    expect(cookie).toMatch(/Path=\/api\/users\/login/)

    const [device] = updateData().twoFactorTrustedDevices
    expect(device.hash).not.toBe(token)
    expect(verifyToken(token!, device.hash)).toBe(true)
    expect(new Date(device.expiresAt).getTime()).toBe(NOW + 30 * 86_400_000)
  })

  it('marks the cookie Secure in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect((await call(trust)).headers.get('set-cookie')).toMatch(/Secure/i)
  })

  it('drops expired devices while adding the new one', async () => {
    mocks.user = {
      id: 'u1',
      twoFactorTrustedDevices: [
        { hash: 'old', expiresAt: new Date(NOW - 1).toISOString() },
        { hash: 'live', expiresAt: new Date(NOW + 1000).toISOString() },
      ],
    }
    await call(trust)
    const hashes = updateData().twoFactorTrustedDevices.map((d: { hash: string }) => d.hash)
    expect(hashes).toHaveLength(2)
    expect(hashes).toContain('live')
    expect(hashes).not.toContain('old')
  })
})
