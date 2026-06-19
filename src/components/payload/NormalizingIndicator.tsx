'use client'

import { useEffect, useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'

// Patch at module load time — useEffect is too late for hydration warnings
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && (args[0].includes('hydrat') || args[0].includes('Hydrat'))) return
    orig(...args)
  }
}

export function NormalizingIndicator() {
  const { id } = useDocumentInfo()
  const { value: normalizeImage } = useField<boolean>({ path: 'normalizeImage' })
  const { value: width } = useField<number>({ path: 'width' })
  const { value: height } = useField<number>({ path: 'height' })

  const isPending =
    !!id &&
    normalizeImage === true &&
    (width !== 1400 || height !== 1400)

  const [done, setDone] = useState(false)
  const [warmingUp, setWarmingUp] = useState(false)

  useEffect(() => {
    if (!isPending) return
    const flagTime = Number(localStorage.getItem('modalWarmingUp') ?? '0')
    if (flagTime && Date.now() - flagTime < 60_000) {
      setWarmingUp(true)
    }
    localStorage.removeItem('modalWarmingUp')
  }, [isPending])

  useEffect(() => {
    if (!isPending || !id) return

    let interval: ReturnType<typeof setInterval>

    interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/media/${id}?depth=0`)
        if (!res.ok) return
        const doc = await res.json()
        if (doc.width === 1400 && doc.height === 1400) {
          clearInterval(interval)
          setDone(true)
          setTimeout(() => window.location.reload(), 600)
        }
      } catch {
        // ignore transient fetch errors
      }
    }, 3000)

    const timeout = setTimeout(() => clearInterval(interval), 3 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isPending, id])

  if (!isPending) return null

  return (
    <div style={{
      padding: '10px 14px',
      marginBottom: '1.5rem',
      background: 'var(--theme-elevation-100)',
      border: '1px solid var(--theme-elevation-200)',
      borderRadius: '4px',
      fontSize: '13px',
      color: 'var(--theme-elevation-800)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: done ? 'var(--theme-success-500)' : 'var(--theme-warning-500, #f59e0b)',
        animation: done ? 'none' : 'pulse 1.4s ease-in-out infinite',
      }} />
      {done
        ? 'Normalization complete. Reloading...'
        : warmingUp
          ? 'Background removal is warming up. Processing may take approx. 20 seconds. You can leave this page.'
          : 'Processing image in background. You can leave this page.'}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  )
}
