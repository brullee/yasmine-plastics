'use client'

import { useEffect } from 'react'

const MAX_DIMENSION  = 3000
const WEBP_QUALITY   = 0.85
const SIZE_THRESHOLD = 200 * 1024 // skip files already under 200 KB

async function compressToWebP(file: File): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img  = new Image()

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.onload  = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(blob => {
        if (!blob || blob.size >= file.size) { resolve(file); return }
        const name = file.name.replace(/\.[^.]+$/, '.webp')
        const compressed = new File([blob], name, { type: 'image/webp' })
        console.log(`[upload] ${file.name} ${(file.size / 1024).toFixed(0)}KB → ${name} ${(compressed.size / 1024).toFixed(0)}KB`)
        resolve(compressed)
      }, 'image/webp', WEBP_QUALITY)
    }

    img.src = url
  })
}

const MODAL_IDLE_MS = 5 * 60 * 1000

function maybeFlagWarmup() {
  const last = Number(localStorage.getItem('lastNormalizeUpload') ?? '0')
  if (Date.now() - last > MODAL_IDLE_MS) {
    localStorage.setItem('modalWarmingUp', 'true')
  }
  localStorage.setItem('lastNormalizeUpload', String(Date.now()))
}

const compressing = new WeakSet<HTMLInputElement>()

async function interceptChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (compressing.has(input))       return
  if (!input.files?.[0])            return
  const file = input.files[0]
  if (!file.type.startsWith('image/')) return
  if (file.size <= SIZE_THRESHOLD)     return

  e.stopImmediatePropagation()
  maybeFlagWarmup()

  const result = await compressToWebP(file)

  const dt = new DataTransfer()
  dt.items.add(result)
  input.files = dt.files

  compressing.add(input)
  input.dispatchEvent(new Event('change', { bubbles: true }))
  compressing.delete(input)
}

export function ClientImageCompressorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const attached = new WeakSet<HTMLInputElement>()

    function attach() {
      document.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach(input => {
        if (attached.has(input)) return
        input.addEventListener('change', interceptChange, { capture: true })
        attached.add(input)
      })
    }

    attach()
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return <>{children}</>
}
