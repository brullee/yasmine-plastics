'use client'

import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function NormalizingIndicator() {
  const { id, initialData } = useDocumentInfo()
  const data = initialData as Record<string, unknown> | undefined

  const isPending =
    data?.normalizeImage === true &&
    typeof data?.mimeType === 'string' &&
    data.mimeType !== 'image/jpeg'

  const [done, setDone] = useState(false)
  const [warmingUp, setWarmingUp] = useState(false)

  useEffect(() => {
    if (!isPending) return
    if (localStorage.getItem('modalWarmingUp') === 'true') {
      setWarmingUp(true)
      localStorage.removeItem('modalWarmingUp')
    }
  }, [isPending])

  useEffect(() => {
    if (!isPending || !id) return

    let interval: ReturnType<typeof setInterval>

    interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/media/${id}?depth=0`)
        if (!res.ok) return
        const doc = await res.json()
        if (doc.mimeType === 'image/jpeg') {
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
          ? 'Background removal is warming up. Processing may take ~20 seconds. You can leave this page.'
          : 'Processing image in background. You can leave this page.'}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  )
}
