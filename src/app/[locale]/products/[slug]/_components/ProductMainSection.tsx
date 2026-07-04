'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ProductActions } from './ProductActions'
import { QuickViewModal } from '@/components/ui/QuickViewModal'
import { ProductImageLightbox } from './ProductImageLightbox'
import { cn, deriveCapacity, prefersReducedMotion } from '@/lib/utils'
import { ChevronIcon, ExpandIcon } from '@/components/ui/Icons'
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
  const t     = useTranslations('product')
  const tA11y = useTranslations('a11y')

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
  const [lightboxOpenAt, setLightboxOpenAt] = useState(0)

  const [hoverZoom, setHoverZoom] = useState(false)
  const [hoverOrigin, setHoverOrigin] = useState({ x: 50, y: 50 })
  const [thumbCanScrollUp, setThumbCanScrollUp]     = useState(false)
  const [thumbCanScrollDown, setThumbCanScrollDown] = useState(false)

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const openerRef         = useRef<HTMLButtonElement>(null)
  const thumbStripRef     = useRef<HTMLDivElement>(null)
  const scrollRafRef      = useRef<number | null>(null)
  const scrollSpeedRef    = useRef(0)
  const hoverTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // ── Color / size → carousel jump ────────────────────────────────────────
  function nudgeToImage() {
    imageContainerRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' })
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
                  onClick={() => thumbStripRef.current?.scrollBy({ top: -200, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
                  className="absolute top-1 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 shadow text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  aria-label={tA11y('scrollUp')}
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
                  aria-current={i === carouselIndex}
                  aria-label={tA11y('goToImage', { n: i + 1 })}
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
                  onClick={() => thumbStripRef.current?.scrollBy({ top: 200, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
                  className="absolute bottom-1 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 shadow text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                  aria-label={tA11y('scrollDown')}
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
            onClick={() => { setLightboxOpenAt(carouselIndex); setLightboxOpen(true) }}
            aria-label={tA11y('viewFullImage')}
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
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 font-mono">
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
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-brand-navy dark:text-white">{value || '-'}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Lightbox ── */}
      <ProductImageLightbox
        images={images}
        name={name}
        initialIndex={lightboxOpenAt}
        isOpen={lightboxOpen}
        onClose={() => { setLightboxOpen(false); openerRef.current?.focus() }}
      />

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

