import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'crypto'
import { Secret, TOTP } from 'otpauth'

const ISSUER = 'Yasmine Plastics'

// AES-256-GCM at rest for the TOTP secret — unlike a password, we need the raw secret back
// to verify future codes, so it can't be one-way hashed like the recovery codes below.
const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const key = process.env.TOTP_ENCRYPTION_KEY
  if (!key) throw new Error('TOTP_ENCRYPTION_KEY is not set')
  return Buffer.from(key, 'base64')
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':')
}

export function decryptSecret(stored: string): string {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(':')
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'))
  const plain = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, 'base64')), decipher.final()])
  return plain.toString('utf8')
}

// Recovery codes are high-entropy random strings we generate ourselves, not user-chosen
// passwords, so a plain fast hash is fine — no need for a slow KDF like bcrypt/argon2 here.
export function hashRecoveryCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export function verifyRecoveryCode(code: string, hash: string): boolean {
  const candidate = Buffer.from(hashRecoveryCode(code), 'hex')
  const stored = Buffer.from(hash, 'hex')
  if (candidate.length !== stored.length) return false
  return timingSafeEqual(candidate, stored)
}

export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => randomBytes(5).toString('hex'))
}

// Generates a fresh secret for account setup — not persisted by this function, the caller
// encrypts it via encryptSecret before saving to the user doc.
export function generateTotpSecret(email: string) {
  const secret = new Secret({ size: 20 })
  const totp = new TOTP({ issuer: ISSUER, label: email, algorithm: 'SHA1', digits: 6, period: 30, secret })
  return { base32: secret.base32, uri: totp.toString() }
}

// `encryptedSecret` is the value already stored on the user doc (via encryptSecret).
// Returns the matched time-step counter on success, or null if the code is wrong.
// `lastUsedStep` (the step persisted from the previous successful verification, if any)
// makes this replay-proof: a captured code is only valid once, even within its ~90s
// window — a second use (whether that's a retry, or someone using it to also disable
// 2FA right after login) matches the same or an earlier step and is rejected. Callers
// that accept success must persist the returned step as the new `lastUsedStep`.
export function verifyTotpCode(encryptedSecret: string, code: string, lastUsedStep?: number | null): number | null {
  const base32 = decryptSecret(encryptedSecret)
  const totp = new TOTP({ issuer: ISSUER, algorithm: 'SHA1', digits: 6, period: 30, secret: Secret.fromBase32(base32) })
  const delta = totp.validate({ token: code, window: 1 })
  if (delta === null) return null
  const step = Math.floor(Date.now() / 1000 / totp.period) + delta
  if (lastUsedStep != null && step <= lastUsedStep) return null
  return step
}
