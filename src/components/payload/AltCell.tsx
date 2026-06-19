'use client'

export function AltCell({ cellData }: { cellData?: string }) {
  if (!cellData) return <span style={{ opacity: 0.3 }}>–</span>
  return <>{cellData}</>
}
