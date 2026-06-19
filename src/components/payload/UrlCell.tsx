'use client'

import { useState } from 'react'

export function UrlCell({ cellData }: { cellData?: string }) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  if (!cellData) return null

  function copy() {
    navigator.clipboard.writeText(cellData!)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={e => { e.stopPropagation(); copy() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={cellData}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
        color: hovered ? 'var(--theme-text)' : 'var(--theme-elevation-800)',
        display: 'flex', alignItems: 'center', gap: 6,
        borderRadius: 4,
        transition: 'color 0.15s, background 0.15s',
        backgroundColor: hovered ? 'var(--theme-elevation-100)' : 'transparent',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {copied
          ? <><polyline points="20 6 9 17 4 12" /></>
          : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
        }
      </svg>
      <span style={{ opacity: 0.6, fontSize: 12 }}>{copied ? 'Copied' : 'Copy URL'}</span>
    </button>
  )
}
