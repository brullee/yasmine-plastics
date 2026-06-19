'use client'

import { useEffect } from 'react'

export function SuppressPayloadHydrationWarning() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const orig = console.error.bind(console)
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : ''
      if (msg.includes('hydrat') || msg.includes('Hydrat')) return
      orig(...args)
    }
    return () => { console.error = orig }
  }, [])
  return null
}
