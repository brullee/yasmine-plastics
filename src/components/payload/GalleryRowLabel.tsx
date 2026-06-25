'use client'

import { useRowLabel } from '@payloadcms/ui'

export function GalleryRowLabel() {
  const { data, rowNumber } = useRowLabel()

  const image = (data as Record<string, unknown>)?.image
  let url: string | null = null
  if (image && typeof image === 'object') {
    const m = image as Record<string, unknown>
    if (typeof m.url === 'string') url = m.url
    else if (typeof m.filename === 'string') url = `/api/media/file/${encodeURIComponent(m.filename)}`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {url && (
        <img
          src={url}
          alt=""
          style={{ width: 36, height: 36, borderRadius: 5, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.12)' }}
        />
      )}
      <span>Image {(rowNumber as number) + 1}</span>
    </div>
  )
}
