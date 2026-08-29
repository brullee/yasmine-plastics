'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { ChevronIcon, XIcon, ScrollWheelIcon } from '@/components/ui/Icons'
import { ProductImage } from '@/components/ui/ProductImage'
import { cn, lockBodyScroll } from '@/lib/utils'

// Shared "dark glass" pill treatment for the lightbox's own controls (close, prev, next):
// idle bg-black/55 + ring, inverts to solid white/black on hover. `pillClassName` sizes the
// visible circle — `p-2` for the close button (tap area == visible pill), `w-10 h-10` for the
// chevrons (a larger invisible `p-4` tap area on the button prevents near-miss dismissals).
function LightboxIconButton({
  onClick, ariaLabel, className, pillClassName, children,
}: {
  onClick: (e: React.MouseEvent) => void
  ariaLabel: string
  className: string
  pillClassName: string
  children: React.ReactNode
}) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={cn('group z-10 text-white', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-white/15 group-hover:bg-white group-hover:text-black transition-colors',
          pillClassName,
        )}
      >
        {children}
      </span>
    </button>
  )
}

interface Props {
  images: string[]
  name: string
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function ProductImageLightbox({ images, name, initialIndex, isOpen, onClose }: Props) {
  const t       = useTranslations('product')
  const tA11y   = useTranslations('a11y')
  const tCommon = useTranslations('common')

  const [lightboxIndex, setLightboxIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [lightboxMouseOrigin, setLightboxMouseOrigin] = useState({ x: 50, y: 50 })
  const [currentFailed, setCurrentFailed] = useState(false)

  const lightboxRef    = useRef<HTMLDivElement>(null)
  const lightboxImgRef = useRef<HTMLDivElement>(null)
  const touchStartX       = useRef<number | null>(null)
  const panPrevRef        = useRef<{ x: number; y: number } | null>(null)
  const pinchStartDistRef = useRef<number | null>(null)
  const pinchStartZoomRef = useRef<number>(1)
  const lastTapTimeRef    = useRef<number>(0)
  const isTouchActiveRef  = useRef(false)
  const lastTouchEndRef   = useRef<number>(0)
  const keyboardZoomRef   = useRef(false)

  const lightboxPrev = useCallback(() =>
    setLightboxIndex((i) => (i - 1 + images.length) % images.length), [images.length])

  const lightboxNext = useCallback(() =>
    setLightboxIndex((i) => (i + 1) % images.length), [images.length])

  const closeLightbox = useCallback(() => onClose(), [onClose])

  // Sync to initialIndex when opening; reset zoom when closing
  useEffect(() => {
    if (isOpen) setLightboxIndex(initialIndex)
    else setZoom(1)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps
  // initialIndex excluded intentionally: only matters at the moment isOpen flips true

  // Reset zoom and failed-state assumption on image change
  useEffect(() => { setZoom(1); setCurrentFailed(false) }, [lightboxIndex])

  // Scroll lock + focus trap
  useEffect(() => {
    if (!isOpen) return
    const unlock = lockBodyScroll()
    const root = document.getElementById('app-root')
    root?.setAttribute('inert', '')
    lightboxRef.current?.focus()
    return () => {
      unlock()
      root?.removeAttribute('inert')
    }
  }, [isOpen])

  // Keyboard: ESC, arrows, Home/End, Tab trap
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     { closeLightbox(); return }
      if (e.key === 'ArrowLeft')  { lightboxPrev(); return }
      if (e.key === 'ArrowRight') { lightboxNext(); return }
      if (e.key === 'ArrowUp')    { if (currentFailed) return; e.preventDefault(); keyboardZoomRef.current = true; setLightboxMouseOrigin({ x: 50, y: 50 }); setZoom(z => Math.min(4, z + 0.4)); return }
      if (e.key === 'ArrowDown')  { if (currentFailed) return; e.preventDefault(); keyboardZoomRef.current = true; setLightboxMouseOrigin({ x: 50, y: 50 }); setZoom(z => Math.max(1, z - 0.4)); return }
      if (e.key === 'Home')       { setLightboxIndex(0); return }
      if (e.key === 'End')        { setLightboxIndex(images.length - 1); return }
      if (e.key === 'Tab') {
        const focusable = lightboxRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable?.length) return
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, lightboxPrev, lightboxNext, closeLightbox, images.length, currentFailed])

  // Scroll-wheel zoom + pinch preventDefault + global mouse tracking
  useEffect(() => {
    if (!isOpen) return
    const el = lightboxRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if (isTouchActiveRef.current || currentFailed) return
      keyboardZoomRef.current = false
      setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.002)))
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length >= 2) e.preventDefault()
    }
    function onMouseMove(e: MouseEvent) {
      if (isTouchActiveRef.current) return
      if (Date.now() - lastTouchEndRef.current < 500) return
      if (keyboardZoomRef.current) return
      const r = lightboxImgRef.current?.getBoundingClientRect()
      if (!r) return
      setLightboxMouseOrigin({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('mousemove', onMouseMove)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('mousemove', onMouseMove)
    }
  }, [isOpen, currentFailed])

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen || images.length <= 1) return
    const preload = (src: string) => { const img = new window.Image(); img.src = src }
    preload(images[(lightboxIndex + 1) % images.length])
    preload(images[(lightboxIndex - 1 + images.length) % images.length])
  }, [lightboxIndex, isOpen, images])

  // ── Touch: swipe, pinch-to-zoom, double-tap ─────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    isTouchActiveRef.current = true
    keyboardZoomRef.current = false
    if (lightboxImgRef.current) lightboxImgRef.current.style.transition = 'none'
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStartDistRef.current = Math.sqrt(dx * dx + dy * dy)
      pinchStartZoomRef.current = zoom
      panPrevRef.current = null
      return
    }
    touchStartX.current = e.touches[0].clientX
    if (zoom > 1) panPrevRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (currentFailed) return
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      setZoom(Math.min(4, Math.max(1, pinchStartZoomRef.current * (dist / pinchStartDistRef.current))))
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      const r = lightboxImgRef.current?.getBoundingClientRect()
      if (r) setLightboxMouseOrigin({ x: ((midX - r.left) / r.width) * 100, y: ((midY - r.top) / r.height) * 100 })
      return
    }
    if (e.touches.length === 1 && zoom > 1 && panPrevRef.current) {
      const dx = e.touches[0].clientX - panPrevRef.current.x
      const dy = e.touches[0].clientY - panPrevRef.current.y
      panPrevRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      const r = lightboxImgRef.current?.getBoundingClientRect()
      if (!r) return
      const zoomMinus1 = Math.max(zoom - 1, 0.001)
      setLightboxMouseOrigin(o => ({
        x: Math.max(0, Math.min(100, o.x - (dx * zoom * 100) / (r.width * zoomMinus1))),
        y: Math.max(0, Math.min(100, o.y - (dy * zoom * 100) / (r.height * zoomMinus1))),
      }))
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) pinchStartDistRef.current = null
    if (e.touches.length === 0) {
      panPrevRef.current = null
      isTouchActiveRef.current = false
      lastTouchEndRef.current = Date.now()
      if (lightboxImgRef.current) lightboxImgRef.current.style.transition = 'transform 0.1s ease'
    }
    if (e.changedTouches.length !== 1 || e.touches.length !== 0) return

    const touch = e.changedTouches[0]
    const now = Date.now()

    if (now - lastTapTimeRef.current < 300) {
      lastTapTimeRef.current = 0
      touchStartX.current = null
      if (!currentFailed) {
        if (zoom > 1) {
          setZoom(1)
        } else {
          const r = lightboxImgRef.current?.getBoundingClientRect()
          if (r) setLightboxMouseOrigin({ x: ((touch.clientX - r.left) / r.width) * 100, y: ((touch.clientY - r.top) / r.height) * 100 })
          setZoom(2.5)
        }
      }
      return
    }
    lastTapTimeRef.current = now

    if (touchStartX.current !== null) {
      const delta = touch.clientX - touchStartX.current
      if (zoom === 1 && Math.abs(delta) > 50) delta < 0 ? lightboxNext() : lightboxPrev()
      touchStartX.current = null
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={lightboxRef}
      role="dialog"
      aria-modal="true"
      aria-label={tA11y('imageOf', { name, current: lightboxIndex + 1, total: images.length })}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center outline-none"
      onClick={closeLightbox}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close */}
      <LightboxIconButton
        onClick={closeLightbox}
        ariaLabel={tA11y('close')}
        className="absolute top-3 end-3"
        pillClassName="p-2"
      >
        <XIcon />
      </LightboxIconButton>

      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute top-3 start-3 z-10 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-white/15 text-white text-sm tabular-nums">
          <span dir="ltr">{lightboxIndex + 1} / {images.length}</span>
        </span>
      )}

      {/* Image */}
      <div
        ref={lightboxImgRef}
        className="relative w-full h-full max-w-5xl max-h-[90vh] mx-2 sm:mx-14"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: `${lightboxMouseOrigin.x}% ${lightboxMouseOrigin.y}%`,
          transition: 'transform 0.1s ease',
          cursor: zoom > 1 ? 'grab' : 'default',
          userSelect: 'none',
          touchAction: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ProductImage
          key={images[lightboxIndex]}
          src={images[lightboxIndex]}
          alt={`${name} ${lightboxIndex + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
          unavailableLabel={tCommon('imageUnavailable')}
          size="lg"
          onFail={() => setCurrentFailed(true)}
        />
      </div>

      {/* Prev / Next — large invisible tap area prevents near-miss dismissals */}
      {images.length > 1 && (
        <>
          <LightboxIconButton
            onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
            ariaLabel={tA11y('previousImage')}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 p-4"
            pillClassName="w-10 h-10"
          >
            <ChevronIcon direction="left" />
          </LightboxIconButton>
          <LightboxIconButton
            onClick={(e) => { e.stopPropagation(); lightboxNext() }}
            ariaLabel={tA11y('nextImage')}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 p-4"
            pillClassName="w-10 h-10"
          >
            <ChevronIcon direction="right" />
          </LightboxIconButton>
        </>
      )}

      {/* Scroll-to-zoom hint — desktop/mouse only, and only when there's actually something to zoom into */}
      {!currentFailed && (
        <div className="pointer-events-none select-none absolute bottom-5 left-1/2 -translate-x-1/2 hidden [@media(hover:hover)]:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-white/15 text-white text-sm">
          <ScrollWheelIcon />
          <span>{t('zoomHint')}</span>
        </div>
      )}
    </div>,
    document.body
  )
}
