'use client'

export function ImageCell({ cellData }: { cellData?: unknown }) {
  if (!cellData || typeof cellData !== 'object') return null
  const doc = cellData as Record<string, unknown>
  const url = (doc.url ?? doc.thumbnailURL) as string | undefined
  const filename = doc.filename as string | undefined
  if (!filename) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {url && <img src={url} alt="" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
        {filename}
      </span>
    </div>
  )
}
