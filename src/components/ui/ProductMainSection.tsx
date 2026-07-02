'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ProductActions } from '@/components/ui/ProductActions'
import { QuickViewModal } from '@/components/ui/QuickViewModal'
import { cn, deriveCapacity } from '@/lib/utils'
import type { Product, Locale } from '@/types'

function formatDimensions(product: Product): string | undefined {
  if (product.shapeType === 'circular' && product.diameterTop && product.height) {
    return product.diameterBottom
      ? `φ${product.diameterTop} × φ${product.diameterBottom} × H${product.height} mm`
      : `φ${product.diameterTop} × H${product.height} mm`
  }
  if (product.shapeType === 'rectangular' && product.width && product.length && product.height)
    return `W${product.width} × L${product.length} × H${product.height} mm`
  return undefined
}

interface Props {
  product: Product
  name: string
  categoryName: string
  compatibleLids: Product[]
  fitsContainers: Product[]
  allProducts: Product[]
  whatsappNumber: string
  locale: Locale
}

export function ProductMainSection({
  product, name, categoryName, compatibleLids, fitsContainers, allProducts, whatsappNumber, locale,
}: Props) {
  const t = useTranslations('product')

  const derivedCapacity = deriveCapacity(product)

  const { images, pairingSlides } = useMemo(() => {
    const ownImages = [product.image, ...(product.gallery ?? [])]
    const slides = fitsContainers.flatMap((c) =>
      (c.pairingImages?.[product.slug] ?? [])
        .filter((url) => !ownImages.includes(url))
        .map((url) => ({ slug: c.slug, url }))
    )
    return { images: [...ownImages, ...slides.map((e) => e.url)], pairingSlides: slides }
  }, [product.image, product.gallery, product.slug, fitsContainers])

  const firstPartnerSlug = compatibleLids[0]?.slug ?? fitsContainers[0]?.slug ?? null

  const [selectedPartner, setSelectedPartner] = useState<string | null>(firstPartnerSlug)
  const [qv, setQv] = useState<{ product: Product; originRect: DOMRect } | null>(null)

  function handlePartnerQuickView(slug: string, rect: DOMRect) {
    const p = [...compatibleLids, ...fitsContainers].find((p) => p.slug === slug)
    if (p) setQv({ product: p, originRect: rect })
  }
  const [selectedColor, setSelectedColor] = useState<string | null>(product.options.colors?.[0]?.en ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(product.options.sizes?.[0] ?? null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [zoom, setZoom] = useState(1)

  const [hoverZoom, setHoverZoom] = useState(false)
  const [hoverOrigin, setHoverOrigin] = useState({ x: 50, y: 50 })
  const [lightboxMouseOrigin, setLightboxMouseOrigin] = useState({ x: 50, y: 50 })
  const [thumbCanScrollUp, setThumbCanScrollUp]     = useState(false)
  const [thumbCanScrollDown, setThumbCanScrollDown] = useState(false)


  const imageContainerRef = useRef<HTMLDivElement>(null)
  const openerRef         = useRef<HTMLButtonElement>(null)
  const lightboxRef       = useRef<HTMLDivElement>(null)
  const lightboxImgRef    = useRef<HTMLDivElement>(null)
  const touchStartX       = useRef<number | null>(null)
  const panPrevRef        = useRef<{ x: number; y: number } | null>(null)
  const thumbStripRef     = useRef<HTMLDivElement>(null)
  const scrollRafRef      = useRef<number | null>(null)
  const scrollSpeedRef    = useRef(0)
  const hoverTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pinchStartDistRef = useRef<number | null>(null)
  const pinchStartZoomRef = useRef<number>(1)
  const lastTapTimeRef    = useRef<number>(0)
  const isTouchActiveRef  = useRef(false)
  const lastTouchEndRef   = useRef<number>(0)

  // Check thumb overflow on mount and image list change; block wheel scroll on strip
  useEffect(() => {
    const el = thumbStripRef.current
    if (!el) return
    const check = () => {
      setThumbCanScrollUp(el.scrollTop > 0)
      setThumbCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
    }
    const blockWheel = (e: WheelEvent) => e.preventDefault()
    check()
    el.addEventListener('scroll', check, { passive: true })
    el.addEventListener('wheel', blockWheel, { passive: false })
    return () => {
      el.removeEventListener('scroll', check)
      el.removeEventListener('wheel', blockWheel)
    }
  }, [images])

  const displayImage = images[carouselIndex]

  function stopThumbScroll() {
    scrollSpeedRef.current = 0
    if (scrollRafRef.current) { cancelAnimationFrame(scrollRafRef.current); scrollRafRef.current = null }
  }

  function clearHoverTimer() {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null }
  }

  function onStripMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!window.matchMedia('(hover: hover)').matches) return
    const el = thumbStripRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const y    = e.clientY - rect.top
    const h    = rect.height
    const zone = h * 0.38

    if (y < zone)
      scrollSpeedRef.current = -((zone - y) / zone) * 5
    else if (y > h - zone)
      scrollSpeedRef.current = ((y - (h - zone)) / zone) * 5
    else
      scrollSpeedRef.current = 0

    if (scrollRafRef.current) return   // loop already running
    let current = 0
    const tick = () => {
      current += (scrollSpeedRef.current - current) * 0.14
      if (Math.abs(current) > 0.05 || Math.abs(scrollSpeedRef.current) > 0.1) {
        el.scrollBy({ top: current })
        scrollRafRef.current = requestAnimationFrame(tick)
      } else {
        current = 0
        scrollRafRef.current = null
      }
    }
    scrollRafRef.current = requestAnimationFrame(tick)
  }

  // ── Lightbox navigation ──────────────────────────────────────────────────
  const lightboxPrev = useCallback(() =>
    setLightboxIndex((i) => (i - 1 + images.length) % images.length), [images.length])

  const lightboxNext = useCallback(() =>
    setLightboxIndex((i) => (i + 1) % images.length), [images.length])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    setZoom(1)
    openerRef.current?.focus()
  }, [])

  // Reset zoom on image change
  useEffect(() => setZoom(1), [lightboxIndex])

  // ── Scroll lock ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top      = `-${scrollY}px`
    document.body.style.width    = '100%'
    lightboxRef.current?.focus()
    return () => {
      document.body.style.position = ''
      document.body.style.top      = ''
      document.body.style.width    = ''
      window.scrollTo(0, scrollY)
    }
  }, [lightboxOpen])

  // ── Keyboard: ESC, arrows, Home/End, Tab trap ────────────────────────────
  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     { closeLightbox(); return }
      if (e.key === 'ArrowLeft')  { lightboxPrev(); return }
      if (e.key === 'ArrowRight') { lightboxNext(); return }
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
  }, [lightboxOpen, lightboxPrev, lightboxNext, closeLightbox, images.length])

  // ── Scroll-wheel zoom + pinch-zoom preventDefault + global mouse tracking ─
  useEffect(() => {
    if (!lightboxOpen) return
    const el = lightboxRef.current
    if (!el) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      if (isTouchActiveRef.current) return
      setZoom((z) => Math.min(4, Math.max(1, z - e.deltaY * 0.002)))
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length >= 2) e.preventDefault()
    }
    function onMouseMove(e: MouseEvent) {
      if (isTouchActiveRef.current) return
      if (Date.now() - lastTouchEndRef.current < 500) return
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
  }, [lightboxOpen])

  // ── Preload adjacent images ──────────────────────────────────────────────
  useEffect(() => {
    if (!lightboxOpen || images.length <= 1) return
    const preload = (src: string) => { const img = new window.Image(); img.src = src }
    preload(images[(lightboxIndex + 1) % images.length])
    preload(images[(lightboxIndex - 1 + images.length) % images.length])
  }, [lightboxIndex, lightboxOpen, images])

  // ── Touch: swipe, pinch-to-zoom, double-tap ─────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    isTouchActiveRef.current = true
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
      // r.width is the scaled width (zoom * CSS width); correct pan factor: zoom / (r.width * (zoom - 1))
      const zoomMinus1 = Math.max(zoom - 1, 0.001)
      setLightboxMouseOrigin(o => ({
        x: Math.max(0, Math.min(100, o.x - (dx * zoom * 100) / (r.width * zoomMinus1))),
        y: Math.max(0, Math.min(100, o.y - (dy * zoom * 100) / (r.height * zoomMinus1))),
      }))
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) pinchStartDistRef.current = null
    if (e.touches.length === 0) { panPrevRef.current = null; isTouchActiveRef.current = false; lastTouchEndRef.current = Date.now(); if (lightboxImgRef.current) lightboxImgRef.current.style.transition = 'transform 0.1s ease' }
    if (e.changedTouches.length !== 1 || e.touches.length !== 0) return

    const touch = e.changedTouches[0]
    const now = Date.now()

    if (now - lastTapTimeRef.current < 300) {
      lastTapTimeRef.current = 0
      touchStartX.current = null
      if (zoom > 1) {
        setZoom(1)
      } else {
        const r = lightboxImgRef.current?.getBoundingClientRect()
        if (r) setLightboxMouseOrigin({ x: ((touch.clientX - r.left) / r.width) * 100, y: ((touch.clientY - r.top) / r.height) * 100 })
        setZoom(2.5)
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

  // ── Color / size → carousel jump ────────────────────────────────────────
  function nudgeToImage() {
    imageContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function handleColorChange(color: string | null) {
    setSelectedColor(color)
    if (!color) return
    const url = product.options.colorImageMap?.[color]
    if (!url) return
    const idx = images.indexOf(url)
    if (idx !== -1) { setCarouselIndex(idx); nudgeToImage() }
  }

  function handleSizeChange(size: string | null) {
    setSelectedSize(size)
    if (!size) return
    const url = product.options.sizeImageMap?.[size]
    if (!url) return
    const idx = images.indexOf(url)
    if (idx !== -1) { setCarouselIndex(idx); nudgeToImage() }
  }

  // ── Partner change ───────────────────────────────────────────────────────
  function handlePartnerChange(slug: string | null) {
    setSelectedPartner(slug)
    if (!slug || slug === '__none__') return
    const ownPairingUrl = product.pairingImages?.[slug]?.[0]
    if (ownPairingUrl) {
      const idx = images.indexOf(ownPairingUrl)
      if (idx !== -1) { setCarouselIndex(idx); nudgeToImage(); return }
    }
    const slide = pairingSlides.find((e) => e.slug === slug)
    if (slide) {
      const idx = images.indexOf(slide.url)
      if (idx !== -1) { setCarouselIndex(idx); nudgeToImage() }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

      {/* ── Left: Image + thumbnails ── */}
      <div ref={imageContainerRef} className="relative">
        {/* Vertical thumbnail strip — absolute so it never affects the image's layout size */}
        {images.length > 1 && (
          <div className="absolute start-0 top-0 bottom-0 w-16 flex flex-col">
            {/* Up arrow + fade */}
            {thumbCanScrollUp && (
              <div className="absolute top-0 inset-x-0 z-10 flex flex-col items-center">
                <div className="w-full h-10 bg-gradient-to-b from-white dark:from-[#0d1b2a] to-transparent" />
                <button
                  onClick={() => thumbStripRef.current?.scrollBy({ top: -200, behavior: 'smooth' })}
                  className="absolute top-1 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 shadow text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  aria-label="Scroll up"
                >
                  <ChevronIcon direction="up" />
                </button>
              </div>
            )}

            {/* Scrollable list */}
            <div
              ref={thumbStripRef}
              className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-none min-h-0"
              style={{ touchAction: 'pan-y' }}
              onMouseMove={onStripMouseMove}
              onMouseLeave={stopThumbScroll}
            >
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  onMouseEnter={() => {
                    clearHoverTimer()
                    hoverTimerRef.current = setTimeout(() => setCarouselIndex(i), 60)
                  }}
                  onMouseLeave={clearHoverTimer}
                  className={cn(
                    'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                    i === carouselIndex
                      ? 'border-brand-navy dark:border-sky-400'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                  )}
                >
                  <Image src={src} alt={`${name} ${i + 1}`} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>

            {/* Down arrow + fade */}
            {thumbCanScrollDown && (
              <div className="absolute bottom-0 inset-x-0 z-10 flex flex-col items-center">
                <div className="w-full h-10 bg-gradient-to-t from-white dark:from-[#0d1b2a] to-transparent" />
                <button
                  onClick={() => thumbStripRef.current?.scrollBy({ top: 200, behavior: 'smooth' })}
                  className="absolute bottom-1 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 shadow text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  aria-label="Scroll down"
                >
                  <ChevronIcon direction="down" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main image — offset by thumb strip width + gap when strip is present */}
        <div
          className={cn(
            'relative rounded-2xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800 shadow-md',
            images.length > 1 && 'ms-[72px]'
          )}
          style={{ cursor: 'default' }}
          onMouseMove={(e) => {
            if (!window.matchMedia('(hover: hover)').matches) return
            const r = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - r.left) / r.width) * 100
            const y = ((e.clientY - r.top) / r.height) * 100
            setHoverOrigin({ x, y })
            const inZone = x > 10 && x < 90 && y > 10 && y < 90
            setHoverZoom(inZone)
          }}
          onMouseLeave={() => setHoverZoom(false)}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: hoverZoom ? 'scale(1.6)' : 'scale(1)',
              transformOrigin: `${hoverOrigin.x}% ${hoverOrigin.y}%`,
              transition: hoverZoom
                ? 'transform 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                : 'transform 380ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}
          >
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover transition-opacity duration-200"
              priority
            />
          </div>

          {/* Expand button */}
          <button
            ref={openerRef}
            type="button"
            onClick={() => openLightbox(carouselIndex)}
            aria-label="View full image"
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/75 border border-gray-200 dark:border-transparent hover:bg-white dark:hover:bg-gray-900 shadow backdrop-blur-sm transition-colors text-gray-600 dark:text-gray-200"
          >
            <ExpandIcon />
          </button>
        </div>
      </div>

      {/* ── Right: Info ── */}
      <div className="space-y-6">

        {/* Name */}
        <div>
          {product.artCode && (
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 font-mono">
              ART-{product.artCode}
            </p>
          )}
          <h1 className="text-xl lg:text-4xl font-bold text-brand-navy dark:text-white leading-tight">
            {name}
          </h1>
        </div>

        {/* Category pill — desktop only */}
        <div className="hidden lg:inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5">
          <span className="text-gray-500 dark:text-gray-400 text-sm">{t('category')}:</span>
          <span className="text-brand-navy dark:text-white font-semibold text-sm">{categoryName}</span>
        </div>

        <ProductActions
          colors={product.options.colors}
          sizes={product.options.sizes}
          sizeUnit={product.options.sizeUnit}
          lids={compatibleLids}
          fitsContainers={fitsContainers}
          selectedPartner={selectedPartner}
          onPartnerChange={handlePartnerChange}
          onPartnerQuickView={handlePartnerQuickView}
          selectedColor={selectedColor}
          onColorChange={handleColorChange}
          selectedSize={selectedSize}
          onSizeChange={handleSizeChange}
          productName={name}
          productSlug={product.slug}
          whatsappNumber={whatsappNumber}
          locale={locale}
        />

        {/* Specifications */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            {t('keyAttributes')}
          </h2>
          <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {[
              { label: t('material'), value: product.material },
              { label: t('capacity'), value: derivedCapacity ? <span dir="ltr">{derivedCapacity}</span> : undefined },
              { label: t('piecesPerBox'), value: product.piecesPerBox?.toString() },
              { label: t('dimensions'), value: formatDimensions(product) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-800 px-4 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-brand-navy dark:text-white">{value || '-'}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Lightbox (portal) ── */}
      {lightboxOpen && createPortal(
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${name}, image ${lightboxIndex + 1} of ${images.length}`}
          tabIndex={-1}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center outline-none"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute top-3 end-3 z-10 p-2 rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-white/15 text-white hover:bg-black/75 transition-colors"
          >
            <XIcon />
          </button>

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
            <Image
              src={images[lightboxIndex]}
              alt={`${name} ${lightboxIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Prev / Next — large invisible tap area prevents near-miss dismissals */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
                aria-label="Previous image"
                className="group absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 p-4 text-white"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-white/15 group-hover:bg-black/75 transition-colors">
                  <ChevronIcon direction="left" />
                </span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext() }}
                aria-label="Next image"
                className="group absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 p-4 text-white"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-white/15 group-hover:bg-black/75 transition-colors">
                  <ChevronIcon direction="right" />
                </span>
              </button>
            </>
          )}

          {/* Scroll-to-zoom hint — desktop/mouse only */}
          <div className="pointer-events-none select-none absolute bottom-5 left-1/2 -translate-x-1/2 hidden [@media(hover:hover)]:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-sm ring-1 ring-white/15 text-white text-sm">
            <ScrollWheelIcon />
            <span>{t('zoomHint')}</span>
          </div>
        </div>,
        document.body
      )}

      {/* ── Partner quick view ── */}
      {qv && (
        <QuickViewModal
          product={qv.product}
          originRect={qv.originRect}
          locale={locale}
          allProducts={allProducts}
          onClose={() => setQv(null)}
        />
      )}
    </div>
  )
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ScrollWheelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="6" />
      <line x1="12" y1="6" x2="12" y2="10" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' | 'up' | 'down' }) {
  const points = {
    left:  '15 18 9 12 15 6',
    right: '9 18 15 12 9 6',
    up:    '18 15 12 9 6 15',
    down:  '6 9 12 15 18 9',
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points={points[direction]} />
    </svg>
  )
}
