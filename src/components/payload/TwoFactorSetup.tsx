'use client'

import { useState, type ChangeEvent } from 'react'
import { Button, Modal, TextInput, useField, useFormFields, useModal } from '@payloadcms/ui'

const ENABLE_SLUG = 'two-factor-enable'
const DISABLE_SLUG = 'two-factor-disable'

// Reuses the same classes Payload's own ConfirmationModal uses (a small, centered dialog)
// rather than Drawer (a full-height side panel — wrong shape for a short QR/code form) or
// hand-rolled positioning. Nesting a <Button> inside a DrawerToggler was also invalid markup
// (DrawerToggler is itself a <button>) — plain Buttons calling openModal directly avoid that.
export function TwoFactorSetup() {
  const { value: enabled } = useField<boolean>({ path: 'twoFactorEnabled' })
  const email = useFormFields(([fields]) => fields.email?.value as string | undefined)
  const { openModal, closeModal } = useModal()

  const [qrDataUrl, setQrDataUrl] = useState('')
  const [manualSecret, setManualSecret] = useState('')
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function startSetup() {
    openModal(ENABLE_SLUG)
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/2fa/setup', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start setup')
      setQrDataUrl(data.qrDataUrl)
      setManualSecret(data.secret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start setup')
    } finally {
      setBusy(false)
    }
  }

  async function confirmSetup(codeValue: string = code) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/2fa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Invalid code')
      setRecoveryCodes(data.recoveryCodes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setBusy(false)
    }
  }

  async function disable(codeValue: string = code) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Invalid code')
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code')
      setBusy(false)
    }
  }

  // Live authenticator codes are always exactly 6 digits (RFC 6238 default, matches the
  // `digits: 6` used in src/lib/totp.ts). The setup-confirm field only ever expects a live
  // code (no recovery codes exist yet at that point), so it's always safe to auto-submit at
  // 6 digits. Disable accepts a recovery code too (10-character hex) — same digit-only guard
  // as the login form, so it only misfires if a recovery code happens to start with 6 digits.
  function onConfirmCodeChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setCode(value)
    if (/^\d{6}$/.test(value)) void confirmSetup(value)
  }

  function onDisableCodeChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setCode(value)
    if (/^\d{6}$/.test(value)) void disable(value)
  }

  function downloadRecoveryCodes() {
    const accountLine = email ? `Account: ${email}\n` : ''
    const blob = new Blob(
      [`Yasmine Plastics — Two-Factor Recovery Codes\n${accountLine}Each code can be used once, in place of an authenticator code.\n\n${recoveryCodes.join('\n')}\n`],
      { type: 'text/plain' },
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const emailSlug = email ? `-${email.replace(/[^a-z0-9]/gi, '-').toLowerCase()}` : ''
    link.download = `yasmine-plastics-recovery-codes${emailSlug}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  function resetAndClose(slug: string) {
    closeModal(slug)
    setQrDataUrl('')
    setManualSecret('')
    setCode('')
    setRecoveryCodes([])
    setError('')
    // The modal's focus trap returns keyboard focus to the trigger button on close (correct
    // accessibility behavior) — but Payload's :focus style on .btn reads as a stuck "pressed"
    // look. Blurring it clears that without fighting the focus-trap itself; deferred a tick
    // since the trap's own focus-restore may not have run yet at this exact point.
    setTimeout(() => (document.activeElement as HTMLElement | null)?.blur(), 0)
  }

  return (
    <div>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Two-factor authentication is{' '}
        <strong>{enabled ? 'enabled' : 'not enabled'}</strong> on this account.
      </p>

      {enabled ? (
        <Button buttonStyle="secondary" onClick={() => openModal(DISABLE_SLUG)}>Disable 2FA</Button>
      ) : (
        <Button buttonStyle="primary" onClick={startSetup}>Enable 2FA</Button>
      )}

      <Modal className="confirmation-modal" slug={ENABLE_SLUG}>
        <div className="confirmation-modal__wrapper">
          <div className="confirmation-modal__content">
            {recoveryCodes.length > 0 ? (
              <>
                <h1>Save Your Recovery Codes</h1>
                <p>
                  Save these now — they will not be shown again. Each one can be used once, in
                  place of an authenticator code, if you lose access to your app.
                </p>
                <pre style={{ padding: 16, background: 'var(--theme-elevation-50)', borderRadius: 4, lineHeight: 2, fontSize: 16, letterSpacing: '0.05em', textAlign: 'left' }}>
                  {recoveryCodes.join('\n')}
                </pre>
              </>
            ) : (
              <>
                <h1>Enable Two-Factor Authentication</h1>
                <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code it shows.</p>
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="2FA QR code" width={200} height={200} />
                )}
                {manualSecret && (
                  <p>
                    Or enter this manually:{' '}
                    <code
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: 'var(--theme-elevation-50)',
                        borderRadius: 4,
                        fontSize: 15,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {manualSecret}
                    </code>
                  </p>
                )}
                <TextInput
                  path="totpConfirmCode"
                  label="6-digit code"
                  value={code}
                  onChange={onConfirmCodeChange}
                />
                {error && <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>}
              </>
            )}
          </div>
          <div className="confirmation-modal__controls">
            {recoveryCodes.length > 0 ? (
              <>
                <Button buttonStyle="secondary" size="large" onClick={downloadRecoveryCodes}>Download codes</Button>
                <Button buttonStyle="primary" size="large" onClick={() => { resetAndClose(ENABLE_SLUG); window.location.reload() }}>
                  I&apos;ve saved these codes
                </Button>
              </>
            ) : (
              <>
                <Button buttonStyle="secondary" size="large" onClick={() => resetAndClose(ENABLE_SLUG)}>Cancel</Button>
                <Button buttonStyle="primary" size="large" onClick={() => confirmSetup()} disabled={busy || code.length < 6}>Confirm</Button>
              </>
            )}
          </div>
        </div>
      </Modal>

      <Modal className="confirmation-modal" slug={DISABLE_SLUG}>
        <div className="confirmation-modal__wrapper">
          <div className="confirmation-modal__content">
            <h1>Disable Two-Factor Authentication</h1>
            <p>Enter your current authenticator or a recovery code to disable two-factor authentication.</p>
            <TextInput
              path="totpDisableCode"
              label="Code"
              value={code}
              onChange={onDisableCodeChange}
            />
            {error && <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>}
          </div>
          <div className="confirmation-modal__controls">
            <Button buttonStyle="secondary" size="large" onClick={() => resetAndClose(DISABLE_SLUG)}>Cancel</Button>
            <Button buttonStyle="primary" size="large" onClick={() => disable()} disabled={busy || code.length < 6}>Disable 2FA</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
