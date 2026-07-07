'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button, FieldLabel, Link, TextInput, useAuth, useConfig } from '@payloadcms/ui'
import { formatAdminURL, getSafeRedirect } from 'payload/shared'

// Plain controlled inputs rather than Payload's Form/EmailField/PasswordField — those are
// tied to Form context for a static field set, but this form's third field only exists
// conditionally (see needsCode below), which is simpler to drive as local state than to
// fight Form's field-registration lifecycle for a field that appears/disappears. TextInput,
// FieldLabel, and Button are all standalone (not Form-context-bound) so this still renders
// with Payload's actual default field/button styling rather than a hand-rolled approximation
// — only the password input is hand-built, matching TextInput's own internal markup, since
// there's no standalone masked-input equivalent exported.
export function LoginViewForm({ searchParams }: { searchParams?: Record<string, string> }) {
  const { config } = useConfig()
  const { admin, routes } = config
  const { routes: adminRoutes, user: userSlug } = admin
  const { forgot: forgotRoute } = adminRoutes
  const { admin: adminRoute, api: apiRoute } = routes
  const { setUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  // Only revealed once the beforeLogin hook itself has confirmed the password is correct
  // and the account has 2FA on (see the specific error-message check below) — never shown
  // upfront for accounts that don't have 2FA enabled at all.
  const [needsCode, setNeedsCode] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitLogin(codeValue: string) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(formatAdminURL({ apiRoute, path: `/${userSlug}/login` }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(needsCode ? { email, password, twoFactorCode: codeValue } : { email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        const message = data?.errors?.[0]?.message ?? 'Login failed'
        if (message === 'Two-factor code required') {
          setNeedsCode(true)
        } else {
          setError(message)
        }
        return
      }

      setUser(data)
      window.location.href = getSafeRedirect({ fallbackTo: adminRoute, redirectTo: searchParams?.redirect ?? '' })
    } catch {
      setError('Login failed')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void submitLogin(code)
  }

  // Live authenticator codes are always exactly 6 digits (RFC 6238 default, matches the
  // `digits: 6` used in src/lib/totp.ts). Recovery codes are longer (10-character hex), so
  // this only auto-submits when the 6 characters are all digits — a recovery code that
  // happens to start with 6 digits before hitting a letter is the one case this can misfire
  // on, but it just needs re-entering, not a real failure.
  function onCodeChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setCode(value)
    if (/^\d{6}$/.test(value)) void submitLogin(value)
  }

  return (
    <form onSubmit={onSubmit} className="login__form">
      <div className="login__form__inputWrap">
        <TextInput
          path="email"
          label="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          readOnly={needsCode}
        />
        <div className="field-type password">
          <FieldLabel label="Password" path="password" required />
          <div className="field-type__wrap">
            <input
              id="field-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              readOnly={needsCode}
              autoComplete="current-password"
            />
          </div>
        </div>
        {needsCode && (
          <TextInput
            path="twoFactorCode"
            label="Authenticator or Recovery Code"
            value={code}
            onChange={onCodeChange}
            required
          />
        )}
      </div>
      {error && <div className="form-submit"><p style={{ color: 'var(--theme-error-500)' }}>{error}</p></div>}
      {!needsCode && (
        <Link href={formatAdminURL({ adminRoute, path: forgotRoute })} prefetch={false}>
          Forgot password?
        </Link>
      )}
      <div className="form-submit">
        <Button type="submit" buttonStyle="primary" size="large" disabled={busy}>
          {needsCode ? 'Verify code' : 'Login'}
        </Button>
      </div>
    </form>
  )
}
