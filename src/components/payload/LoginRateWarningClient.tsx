'use client'

import { Banner } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

export function LoginRateWarningClient({
  initialRemaining,
  initialReset,
}: {
  initialRemaining: number
  initialReset: number
}) {
  const [state, setState] = useState({ remaining: initialRemaining, reset: initialReset })

  useEffect(() => {
    const check = () =>
      fetch('/api/login-limit')
        .then(r => r.json())
        .then(data => setState(data))
        .catch(() => {})

    const onSubmit = () => {
      setTimeout(check, 800)
      setTimeout(check, 2200)
    }

    document.addEventListener('submit', onSubmit)
    return () => document.removeEventListener('submit', onSubmit)
  }, [])

  if (state.remaining > 2) return null

  let msg: string
  if (state.remaining <= 0) {
    msg = 'Too many failed attempts. Please try again later.'
  } else if (state.remaining === 1) {
    msg = "One more failed attempt and you'll be temporarily locked out."
  } else {
    msg = '2 attempts left before a temporary lockout. Try resetting your password.'
  }

  const isLocked = state.remaining <= 0

  const icon = isLocked ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  )

  return (
    <Banner type={state.remaining <= 1 ? 'error' : 'default'}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        {msg}
      </span>
    </Banner>
  )
}
