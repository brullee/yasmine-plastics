'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { company } from '@/data/company'
import { buildWhatsAppUrl, localizedName } from '@/lib/utils'
import type { Product, Locale } from '@/types'

const EASE_OPEN  = 'cubic-bezier(.55,0,.1,1)'
const EASE_CLOSE = 'cubic-bezier(.2,.75,.5,1)'

type Phase = 'placed' | 'flying' | 'expanding' | 'open' | 'closing'

function calcLayout(rect: DOMRect) {
  const vw = window.innerWidth, vh = window.innerHeight
  const imgSize = Math.min(380, vw * 0.44, vh * 0.6)
  // Panel is taller than the image to accommodate many options
  const boxH    = Math.min(Math.max(imgSize + 80, 560), vh * 0.90)
  const panelW  = Math.min(imgSize + 460, vw * 0.92, 900)
  const imgTop  = (vh - imgSize) / 2
  const boxTop  = (vh - boxH) / 2
  return {
    placed: { top: rect.top,  left: rect.left,           width: rect.width,  height: rect.height  },
    image:  { top: imgTop,    left: (vw - imgSize) / 2,  width: imgSize,     height: imgSize      },
    panel:  { top: boxTop,    left: (vw - panelW)  / 2,  width: panelW,      height: boxH         },
    imgSize,
    boxH,
  }
}

interface Props {
  product: Product
  locale: Locale
  originRect: DOMRect
  onClose: () => void
  allProducts?: Product[]
}

export function QuickViewModal({ product, locale, originRect, onClose, allProducts }: Props) {
  const t         = useTranslations('product')
  const tProducts = useTranslations('products')

  const [phase, setPhase] = useState<Phase>('placed')
  const [layout]          = useState(() => calcLayout(originRect))
  const [imgIndex, setImgIndex] = useState(0)

  const images  = [product.image, ...(product.gallery ?? [])]
  const hasMany = images.length > 1

  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setImgIndex(i => (i + 1) % images.length)

  // Scroll lock + keyboard
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     handleClose()
      if (e.key === 'ArrowLeft')  prevImg()
      if (e.key === 'ArrowRight') nextImg()
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Phase sequencing — mirrors Nectar timing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flying'),    75)
    const t2 = setTimeout(() => setPhase('expanding'), 75 + 760)
    const t3 = setTimeout(() => setPhase('open'),      75 + 760 + 560)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    setPhase('closing')
    setTimeout(onClose, 320)
  }

  const resolvedLids = allProducts && product.category !== 'cups'
    ? (product.compatibleLids ?? [])
        .map(s => allProducts.find(p => p.slug === s) ?? null)
        .filter((p): p is Product => p !== null)
    : []

  const fitsContainers = allProducts && (product.category === 'lids' || product.category === 'papercup-lids')
    ? allProducts.filter(p => p.compatibleLids?.includes(product.slug))
    : []

  const name        = localizedName(product, locale)
  const whatsappUrl = buildWhatsAppUrl(company.whatsapp,
    locale === 'ar'
      ? `مرحباً، أنا مهتم بـ: ${name} (${product.slug})`
      : `Hi, I'm interested in: ${name} (${product.slug})`
  )

  const l = layout
  const boxStyle = ((): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed', zIndex: 61,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 32px 64px -12px rgba(0,0,0,0.4)',
    }
    switch (phase) {
      case 'placed':
        return { ...base, top: l.placed.top, left: l.placed.left, width: l.placed.width, height: l.placed.height, boxShadow: 'none', transition: 'none' }
      case 'flying':
        return { ...base, top: l.image.top, left: l.image.left, width: l.image.width, height: l.image.height,
          transition: `top 750ms ${EASE_OPEN}, left 750ms ${EASE_OPEN}, width 750ms ${EASE_OPEN}, height 750ms ${EASE_OPEN}` }
      case 'expanding':
        return { ...base, top: l.panel.top, left: l.panel.left, width: l.panel.width, height: l.panel.height,
          transition: `top 550ms ${EASE_OPEN}, left 550ms ${EASE_OPEN}, width 550ms ${EASE_OPEN}, height 550ms ${EASE_OPEN}` }
      case 'open':
        return { ...base, top: l.panel.top, left: l.panel.left, width: l.panel.width, height: l.panel.height, transition: 'none' }
      case 'closing':
        return { ...base, top: l.panel.top, left: l.panel.left, width: l.panel.width, height: l.panel.height,
          transform: 'scale(0.85)', opacity: 0,
          transition: `transform 300ms ${EASE_CLOSE}, opacity 300ms ${EASE_CLOSE}` }
    }
  })()

  const backdropOpacity = phase === 'placed' || phase === 'closing' ? 0 : 0.6
  const contentVisible  = phase === 'open'

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: backdropOpacity,
          transition: phase === 'closing' ? `opacity 300ms ${EASE_CLOSE}` : 'opacity 300ms ease',
          pointerEvents: phase === 'placed' ? 'none' : 'auto',
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Animated box */}
      <div style={boxStyle} role="dialog" aria-modal="true" aria-label={name}>
        <div className="flex h-full bg-white dark:bg-slate-900">

          {/* Image side — no separate background so there's no visible dividing line */}
          <div
            className="relative shrink-0 overflow-hidden bg-gray-50 dark:bg-slate-800"
            style={{ width: l.imgSize, minWidth: l.imgSize }}
          >
            <Image
              key={imgIndex}
              src={images[imgIndex]}
              alt={`${name} ${imgIndex + 1}`}
              fill
              sizes="400px"
              className="object-contain p-5"
              priority
            />

            {hasMany && (
              <>
                <button onClick={prevImg} aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 shadow text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                  <ChevronIcon direction="left" />
                </button>
                <button onClick={nextImg} aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 shadow text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                  <ChevronIcon direction="right" />
                </button>

                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      aria-label={`Image ${i + 1}`}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        i === imgIndex
                          ? 'bg-brand-navy dark:bg-white'
                          : 'bg-black/25 dark:bg-white/40'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Explicit 1px divider — intentional, not an artifact */}
          <div className="w-px shrink-0 bg-gray-100 dark:bg-slate-800" />

          {/* Content side */}
          <div
            className="flex flex-col gap-4 p-6 min-w-0 flex-1 overflow-y-auto"
            style={{
              opacity:    contentVisible ? 1 : 0,
              transition: contentVisible ? 'opacity 0.28s ease' : 'none',
            }}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-3 end-3 z-10 p-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300"
            >
              <XIcon />
            </button>

            {/* Category pill */}
            <span className="self-start text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/40 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {product.category}
            </span>

            {/* Name */}
            <h2 className="text-xl font-bold text-brand-navy dark:text-white leading-snug">
              {name}
            </h2>

            {/* Specs — material, capacity, piecesPerBox */}
            {(product.material || product.capacity || product.piecesPerBox) && (
              <div className="flex flex-wrap gap-2">
                {product.material && (
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {product.material}
                  </span>
                )}
                {product.capacity && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                    {product.capacity}
                  </span>
                )}
                {product.piecesPerBox && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                    {product.piecesPerBox} pcs/box
                  </span>
                )}
              </div>
            )}

            {/* Colors */}
            {product.options.colors && product.options.colors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('availableColors')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.options.colors.map((color) => (
                    <span key={color.en} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                      {locale === 'ar' ? color.ar : color.en}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.options.sizes && product.options.sizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('availableSizes')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.options.sizes.map((size) => (
                    <span key={size} dir="ltr" className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                      {size}{product.options.sizeUnit ?? ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible lids */}
            {resolvedLids.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('compatibleLids')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {resolvedLids.map((lid) => (
                    <Link
                      key={lid.slug}
                      href={`/products/${lid.slug}`}
                      onClick={handleClose}
                      className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-brand-navy dark:text-sky-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {localizedName(lid, locale)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Fits these containers */}
            {fitsContainers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('fitsContainers')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fitsContainers.map((container) => (
                    <Link
                      key={container.slug}
                      href={`/products/${container.slug}`}
                      onClick={handleClose}
                      className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-brand-navy dark:text-sky-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {localizedName(container, locale)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <Link
                href={`/products/${product.slug}`}
                onClick={handleClose}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navyDark transition-colors"
              >
                {tProducts('viewDetails')} {locale === 'ar' ? '←' : '→'}
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 dark:border-slate-700 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-brand-navy dark:text-gray-300"
              >
                <WhatsAppIcon />
                {t('chatNow')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points={direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
