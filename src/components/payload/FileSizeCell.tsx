'use client'

export function FileSizeCell({ cellData }: { cellData?: number }) {
  if (!cellData) return null
  if (cellData >= 1024 * 1024) return <>{(cellData / (1024 * 1024)).toFixed(1)} MB</>
  return <>{(cellData / 1024).toFixed(0)} KB</>
}
