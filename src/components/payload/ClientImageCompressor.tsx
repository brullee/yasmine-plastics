'use client'

import { useEffect } from 'react'

const MAX_DIMENSION     = 3000
const WEBP_QUALITY      = 1.0
const MAX_FILE_SIZE     = 10 * 1024 * 1024
const CONVERTIBLE_TYPES = new Set(['image/jpeg', 'image/png'])

async function compressToWebP(file: File): Promise<File> {
  if (!CONVERTIBLE_TYPES.has(file.type)) return file

  return new Promise((resolve) => {
    let url: string
    try {
      url = URL.createObjectURL(file)
    } catch {
      resolve(file); return
    }

    const img = new Image()
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.onload  = () => {
      URL.revokeObjectURL(url)
      try {
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
          try {
            if (!blob || blob.type !== 'image/webp') { resolve(file); return }
            const name = file.name.replace(/\.[^.]+$/, '.webp')
            const converted = new File([blob], name, { type: 'image/webp' })
            console.log(`[upload] ${file.name} ${(file.size / 1024).toFixed(0)}KB -> ${name} ${(converted.size / 1024).toFixed(0)}KB`)
            resolve(converted)
          } catch { resolve(file) }
        }, 'image/webp', WEBP_QUALITY)
      } catch { resolve(file) }
    }

    img.src = url
  })
}

const MODAL_IDLE_MS = 5 * 60 * 1000

function maybeFlagWarmup() {
  try {
    const last = Number(localStorage.getItem('lastNormalizeUpload') ?? '0')
    if (Date.now() - last > MODAL_IDLE_MS) {
      localStorage.setItem('modalWarmingUp', String(Date.now()))
    }
    localStorage.setItem('lastNormalizeUpload', String(Date.now()))
  } catch {
    // localStorage may be blocked (private browsing, storage quota exceeded)
  }
}

function createProgressOverlay(total: number, onCancel: () => void) {
  // Animated bars + keyframes matching Payload's own loading-overlay style
  const styleEl = document.createElement('style')
  styleEl.textContent = [
    '@keyframes _cic_odd{0%{transform:translateY(-2px)}50%{transform:translateY(2px)}100%{transform:translateY(-2px)}}',
    '@keyframes _cic_even{0%{transform:translateY(2px)}50%{transform:translateY(-2px)}100%{transform:translateY(2px)}}',
    '._cic-bar{width:2px;height:15px;background:currentColor}',
    '._cic-bar:nth-child(odd){animation:_cic_odd 1.25s infinite}',
    '._cic-bar:nth-child(even){animation:_cic_even 1.25s infinite}',
  ].join('')
  document.head.appendChild(styleEl)

  const bars = document.createElement('div')
  bars.style.cssText = 'display:grid;grid-template-columns:repeat(5,2px);gap:7px;align-items:center;color:var(--theme-text)'
  for (let i = 0; i < 5; i++) {
    const bar = document.createElement('div')
    bar.className = '_cic-bar'
    bars.appendChild(bar)
  }

  const label = document.createElement('span')
  label.style.cssText = 'font-family:var(--font-body);font-size:10.4px;text-transform:uppercase;letter-spacing:3px;color:var(--theme-text)'
  label.textContent = `Compressing 0 / ${total}`

  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.textContent = 'Cancel'
  cancelBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-family:var(--font-body);font-size:10.4px;letter-spacing:2px;text-transform:uppercase;color:var(--theme-elevation-400);padding:0'
  cancelBtn.onmouseenter = () => { cancelBtn.style.color = 'var(--theme-text)' }
  cancelBtn.onmouseleave = () => { cancelBtn.style.color = 'var(--theme-elevation-400)' }

  const content = document.createElement('div')
  content.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px'
  content.append(bars, label, cancelBtn)

  // Inject into the .dropzone (already position:relative) inside the bulk-upload area.
  // Fallback to the dropArea wrapper, then to a fixed bottom-center toast.
  const inlineTarget = document.querySelector<HTMLElement>(
    '.bulk-upload--add-files__dropArea .dropzone, .bulk-upload--add-files__dropArea'
  )
  let rootEl: HTMLElement
  let cleanupPositioning: () => void

  if (inlineTarget) {
    const overlay = document.createElement('div')
    overlay.style.cssText = [
      'position:absolute;inset:0;z-index:10',
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'background:var(--theme-elevation-50)',   // same bg as the dropzone surface
      'border-radius:var(--style-radius-s)',
    ].join(';')
    overlay.appendChild(content)
    // Only set position:relative if the target doesn't already have it (.dropzone does, dropArea doesn't)
    const prevPosition = inlineTarget.style.position
    if (getComputedStyle(inlineTarget).position === 'static') {
      inlineTarget.style.position = 'relative'
    }
    inlineTarget.appendChild(overlay)
    rootEl = overlay
    cleanupPositioning = () => {
      overlay.remove()
      inlineTarget.style.position = prevPosition
      styleEl.remove()
    }
  } else {
    // Fixed bottom-center toast fallback (no inline target found)
    const wrap = document.createElement('div')
    wrap.style.cssText = [
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%)',
      'background:var(--theme-elevation-100);border:1px solid var(--theme-border-color)',
      'padding:20px 28px;border-radius:var(--style-radius-m)',
      'z-index:calc(var(--z-status) + 1)',
    ].join(';')
    wrap.appendChild(content)
    document.body.appendChild(wrap)
    rootEl = wrap
    cleanupPositioning = () => { wrap.remove(); styleEl.remove() }
  }

  // Detect external removal (drawer close, ESC) and fire onCancel.
  // We disconnect BEFORE our own dismiss() call so it doesn't misfire on success.
  const observer = new MutationObserver(() => {
    if (!document.contains(rootEl)) {
      observer.disconnect()
      onCancel()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  cancelBtn.onclick = (e) => {
    e.stopPropagation()
    observer.disconnect()
    cleanupPositioning()
    onCancel()
  }

  return {
    update(done: number) { label.textContent = `Compressing ${done} / ${total}` },
    dismiss() { observer.disconnect(); cleanupPositioning() },
  }
}

const compressing = new WeakSet<HTMLInputElement>()

async function dispatchCompressed(input: HTMLInputElement, files: File[]) {
  // Payload's AddFilesView unmounts its <input> the moment the first file lands
  // (DrawerContent flips to AddingFilesView). One-at-a-time dispatches after
  // that hit a detached node and are silently lost. We must dispatch everything
  // in a single event. Show a progress overlay during compression.
  let cancelled = false
  const overlay = files.length > 1 ? createProgressOverlay(files.length, () => { cancelled = true }) : null
  let doneCount = 0
  const tooBig: string[] = []

  let results: (File | null)[]
  try {
    results = await Promise.all(files.map(async (file) => {
      const result = await compressToWebP(file)
      doneCount++
      overlay?.update(doneCount)
      if (result.size > MAX_FILE_SIZE) { tooBig.push(file.name); return null }
      return result
    }))
  } catch (err) {
    console.error('[upload] Compression failed:', err)
    overlay?.dismiss()
    return
  }

  overlay?.dismiss()

  if (cancelled) return

  const valid = results.filter((f): f is File => f !== null)

  if (valid.length === 0) {
    alert('All images are too large after compression. Maximum is 10MB.')
    input.value = ''
    return
  }

  if (tooBig.length) {
    alert(`${tooBig.length} image${tooBig.length > 1 ? 's are' : ' is'} too large after compression (max 10MB) and will be skipped.`)
  }

  try {
    const dt = new DataTransfer()
    valid.forEach(f => dt.items.add(f))
    input.files = dt.files
    compressing.add(input)
    input.dispatchEvent(new Event('change', { bubbles: true }))
    compressing.delete(input)
  } catch (err) {
    console.error('[upload] Dispatch failed:', err)
  }
}

async function interceptChange(e: Event) {
  try {
    const input = e.target
    if (!(input instanceof HTMLInputElement) || input.type !== 'file') return
    if (compressing.has(input)) return
    const files = Array.from(input.files ?? []).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    e.stopImmediatePropagation()
    maybeFlagWarmup()
    await dispatchCompressed(input, files)
  } catch (err) {
    console.error('[upload] interceptChange error:', err)
  }
}

async function interceptDrop(e: DragEvent) {
  try {
    const dropzone = (e.target as HTMLElement | null)?.closest?.('.dropzone')
    if (!dropzone) return
    const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
    if (!files.length) return
    const input = dropzone.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input) return
    e.stopImmediatePropagation()
    e.preventDefault()
    maybeFlagWarmup()
    await dispatchCompressed(input, files)
  } catch (err) {
    console.error('[upload] interceptDrop error:', err)
  }
}

export function ClientImageCompressorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Capture-phase listeners on `document` itself, rather than on each dropzone/input
    // element directly. Payload's own Dropzone component attaches its native `drop`
    // listener straight onto the same dropzone <div> we used to target — and when two
    // listeners sit on the exact same element, the capture flag doesn't decide order,
    // they fire in registration order. Whichever of our effect vs. Payload's attached
    // first won the race, which is what let raw (uncompressed) drops slip through
    // intermittently. A capture listener on `document` (an ancestor of every dropzone)
    // always fires before any listener on a descendant target, drop or change, no
    // matter which one mounts first — and it also covers drawers that don't exist yet
    // at mount, so no MutationObserver rescan is needed either.
    document.addEventListener('change', interceptChange, { capture: true })
    document.addEventListener('drop', interceptDrop, { capture: true })
    return () => {
      document.removeEventListener('change', interceptChange, { capture: true })
      document.removeEventListener('drop', interceptDrop, { capture: true })
    }
  }, [])

  return <>{children}</>
}
