import { randomBytes } from 'crypto'
import { Secret, TOTP } from 'otpauth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  generateTrustToken,
  hashToken,
  verifyToken,
  verifyTotpCode,
} from '@/lib/totp'

const KEY = randomBytes(32).toString('base64')

beforeEach(() => {
  vi.stubEnv('TOTP_ENCRYPTION_KEY', KEY)
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('secret encryption', () => {
  it('round-trips a secret', () => {
    expect(decryptSecret(encryptSecret('JBSWY3DPEHPK3PXP'))).toBe('JBSWY3DPEHPK3PXP')
  })

  it('uses a fresh IV each time, so equal secrets never encrypt the same', () => {
    expect(encryptSecret('same')).not.toBe(encryptSecret('same'))
  })

  it('does not store the secret in plain text', () => {
    expect(encryptSecret('JBSWY3DPEHPK3PXP')).not.toContain('JBSWY3DPEHPK3PXP')
  })

  it('rejects a tampered ciphertext', () => {
    const [iv, tag, data] = encryptSecret('JBSWY3DPEHPK3PXP').split(':')
    const flipped = Buffer.from(data, 'base64')
    flipped[0] ^= 1
    expect(() => decryptSecret([iv, tag, flipped.toString('base64')].join(':'))).toThrow()
  })

  it('rejects a tampered auth tag', () => {
    const [iv, tag, data] = encryptSecret('JBSWY3DPEHPK3PXP').split(':')
    const flipped = Buffer.from(tag, 'base64')
    flipped[0] ^= 1
    expect(() => decryptSecret([iv, flipped.toString('base64'), data].join(':'))).toThrow()
  })

  it('rejects a secret encrypted with a different key', () => {
    const stored = encryptSecret('JBSWY3DPEHPK3PXP')
    vi.stubEnv('TOTP_ENCRYPTION_KEY', randomBytes(32).toString('base64'))
    expect(() => decryptSecret(stored)).toThrow()
  })

  it('refuses to run without a key', () => {
    vi.stubEnv('TOTP_ENCRYPTION_KEY', '')
    expect(() => encryptSecret('x')).toThrow('TOTP_ENCRYPTION_KEY is not set')
  })
})

describe('token hashing', () => {
  it('verifies the matching token', () => {
    const token = generateTrustToken()
    expect(verifyToken(token, hashToken(token))).toBe(true)
  })

  it('rejects a different token', () => {
    expect(verifyToken(generateTrustToken(), hashToken(generateTrustToken()))).toBe(false)
  })

  it('is case-sensitive, which is why the login hook lowercases codes first', () => {
    expect(verifyToken('ABCDEF0123', hashToken('abcdef0123'))).toBe(false)
  })

  it('rejects malformed or empty stored hashes instead of throwing', () => {
    expect(verifyToken('abc', '')).toBe(false)
    expect(verifyToken('abc', 'not-hex')).toBe(false)
    expect(verifyToken('abc', hashToken('abc').slice(0, 10))).toBe(false)
  })

  it('never returns the token itself as the hash', () => {
    const token = generateTrustToken()
    expect(hashToken(token)).not.toContain(token)
  })
})

describe('random generators', () => {
  it('makes 10 unique lowercase-hex recovery codes by default', () => {
    const codes = generateRecoveryCodes()
    expect(codes).toHaveLength(10)
    expect(new Set(codes).size).toBe(10)
    for (const c of codes) expect(c).toMatch(/^[0-9a-f]{10}$/)
  })

  it('makes 256-bit trust tokens', () => {
    expect(generateTrustToken()).toMatch(/^[0-9a-f]{64}$/)
    expect(generateTrustToken()).not.toBe(generateTrustToken())
  })

  it('makes a 160-bit TOTP secret and an otpauth URI for the given email', () => {
    const { base32, uri } = generateTotpSecret('admin@example.com')
    expect(base32).toMatch(/^[A-Z2-7]{32}$/)
    expect(uri).toContain('otpauth://totp/')
    expect(uri).toContain('admin%40example.com')
    expect(uri).toContain(`secret=${base32}`)
  })
})

describe('verifyTotpCode', () => {
  const NOW = new Date('2026-11-05T12:00:10Z').getTime()
  const base32 = new Secret({ size: 20 }).base32
  const totp = new TOTP({ algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(base32) })
  const codeAt = (ms: number) => totp.generate({ timestamp: ms })
  const stepAt = (ms: number) => Math.floor(ms / 1000 / 30)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  it('accepts the current code and returns its time step', () => {
    expect(verifyTotpCode(encryptSecret(base32), codeAt(NOW))).toBe(stepAt(NOW))
  })

  it('accepts a code from one step either side, for clock drift', () => {
    const stored = encryptSecret(base32)
    expect(verifyTotpCode(stored, codeAt(NOW - 30_000))).toBe(stepAt(NOW) - 1)
    expect(verifyTotpCode(stored, codeAt(NOW + 30_000))).toBe(stepAt(NOW) + 1)
  })

  it('rejects a code two steps old', () => {
    expect(verifyTotpCode(encryptSecret(base32), codeAt(NOW - 60_000))).toBeNull()
  })

  it('rejects a wrong code', () => {
    const wrong = String((Number(codeAt(NOW)) + 1) % 1_000_000).padStart(6, '0')
    expect(verifyTotpCode(encryptSecret(base32), wrong)).toBeNull()
  })

  it('rejects a code made from a different secret', () => {
    const other = new Secret({ size: 20 }).base32
    expect(verifyTotpCode(encryptSecret(other), codeAt(NOW))).toBeNull()
  })

  it('rejects replaying the same code', () => {
    const stored = encryptSecret(base32)
    const step = verifyTotpCode(stored, codeAt(NOW))
    expect(step).not.toBeNull()
    expect(verifyTotpCode(stored, codeAt(NOW), step)).toBeNull()
  })

  it('rejects an older code once a newer one was used', () => {
    const stored = encryptSecret(base32)
    const step = verifyTotpCode(stored, codeAt(NOW))
    expect(verifyTotpCode(stored, codeAt(NOW - 30_000), step)).toBeNull()
  })

  it('accepts the next code after a used one', () => {
    const stored = encryptSecret(base32)
    const step = verifyTotpCode(stored, codeAt(NOW))
    vi.setSystemTime(NOW + 30_000)
    expect(verifyTotpCode(stored, codeAt(NOW + 30_000), step)).toBe(stepAt(NOW) + 1)
  })

  it('rejects empty and non-numeric input', () => {
    const stored = encryptSecret(base32)
    expect(verifyTotpCode(stored, '')).toBeNull()
    expect(verifyTotpCode(stored, 'abcdef')).toBeNull()
  })
})
