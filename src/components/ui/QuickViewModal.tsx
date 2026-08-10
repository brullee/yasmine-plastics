'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ProductImage } from '@/components/ui/ProductImage'
import { cn, buildWhatsAppUrl, localizedName, deriveCapacity, prefersReducedMotion } from '@/lib/utils'
import { button } from '@/lib/theme'
import { company } from '@/data/company'
import { ArrowIcon, ChevronIcon, XIcon, WhatsAppIcon } from '@/components/ui/Icons'
import { SpecBadge } from '@/components/ui/SpecBadge'
import { ValuePill } from '@/components/ui/ValuePill'
import type { Product, Locale } from '@/types'

const EASE_OPEN  = 'cubic-bezier(0.25,1,0.5,1)'
const EASE_CLOSE = 'cubic-bezier(0.4,0,1,1)'

type Phase = 'placed' | 'flying' | 'expanding' | 'open' | 'closing'

function calcLayout(rect: DOMRect) {
  const vw = window.innerWidth, vh = window.innerHeight
  const imgSize = Math.min(440, vw * 0.46, vh * 0.62)
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
  const tA11y     = useTranslations('a11y')

  const [phase, setPhase] = useState<Phase>('placed')
  const [layout]          = useState(() => calcLayout(originRect))
  const [imgIndex, setImgIndex] = useState(0)
  const [boxCleared, setBoxCleared] = useState(false)
  const [contentReady, setContentReady] = useState(false)

  const dialogRef  = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // A lid (the "child" side of a pairing) has no pairing photos of its own — those
  // combined container+lid photos live on the container's gallery, keyed by lid slug
  // (see payload-data.ts). Pull them in here the same way the full product page does
  // (ProductMainSection.tsx's pairingSlides), so a lid's Quick View isn't stuck with
  // only its own solo product shot.
  // fitsContainers/images/resolvedLids all derive only from product+allProducts, which
  // are fixed for this modal's whole lifetime — but phase/imgIndex/boxCleared/contentReady
  // re-render it constantly during the open animation and image nav. Memoized so those
  // unrelated state changes don't re-run a filter/find pass over the full catalog every time.
  const fitsContainers = useMemo(() => (
    allProducts && (product.category === 'lids' || product.category === 'papercup-lids')
      ? allProducts.filter(p => p.compatibleLids?.includes(product.slug))
      : []
  ), [allProducts, product])

  const images = useMemo(() => {
    const ownImages = [product.image, ...(product.gallery ?? [])]
    const pairingImages = fitsContainers.flatMap(c =>
      (c.pairingImages?.[product.slug] ?? []).filter(url => !ownImages.includes(url))
    )
    return [...ownImages, ...pairingImages]
  }, [product, fitsContainers])
  const hasMany = images.length > 1

  const prevImg = () => setImgIndex(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setImgIndex(i => (i + 1) % images.length)

  // Focus management: remember opener, move focus in, hide background from AT, restore on close
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement | null
    const root = document.getElementById('app-root')
    root?.setAttribute('inert', '')
    dialogRef.current?.focus()
    return () => {
      root?.removeAttribute('inert')
      triggerRef.current?.focus()
    }
  }, [])

  // Scroll lock + keyboard
  useEffect(() => {
    // Plain overflow:hidden used to be here, but it let the header's position:sticky
    // detach — same fixed-position/scroll-restore trick ProductImageLightbox already
    // uses for its own scroll lock. html's global `scroll-behavior: smooth` (globals.css)
    // animates the browser's own scrollTop-clamp when body leaves the flow, which reads
    // as the page sailing up to the top instead of staying put — suspended for the
    // duration of the lock so the position swap and restore are both instant.
    const scrollY = window.scrollY
    const htmlEl = document.documentElement
    const prevScrollBehavior = htmlEl.style.scrollBehavior
    htmlEl.style.scrollBehavior = 'auto'
    document.body.style.position = 'fixed'
    document.body.style.top      = `-${scrollY}px`
    document.body.style.width    = '100%'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     { handleClose(); return }
      if (e.key === 'ArrowLeft')  { prevImg(); return }
      if (e.key === 'ArrowRight') { nextImg(); return }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
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
    return () => {
      document.body.style.position = ''
      document.body.style.top      = ''
      document.body.style.width    = ''
      window.scrollTo(0, scrollY)
      htmlEl.style.scrollBehavior = prevScrollBehavior
      window.removeEventListener('keydown', onKey)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prefersReducedMotion()) { setPhase('open'); setContentReady(true); return }
    const t1 = setTimeout(() => setPhase('flying'),    16)
    const t2 = setTimeout(() => setPhase('expanding'), 16 + 320)
    const t3 = setTimeout(() => setPhase('open'),      16 + 320 + 370)
    // Promotes the box above chrome partway through the 320ms flying transition instead of
    // waiting for expanding to start — EASE_OPEN front-loads most of the vertical motion, so
    // the box has typically cleared the header well before flying's own timer ends. Tune
    // this number by eye: too low and the box pops in front of the header before it's
    // actually clear of it; too high and it's back to waiting the full flying duration.
    const t1b = setTimeout(() => setBoxCleared(true), 16 + 130)
    // Content used to wait for the full 706ms sequence (flying + all of expanding) before
    // showing at all — reveals it before expanding's own 370ms timer ends instead, once the
    // box's fast-out easing (cubic-bezier(0.2,0,0,1)) has it close enough to its final panel
    // size. 150ms in (vs expanding's 370ms) still had visible resize left — buttons/text were
    // reflowing to catch up, reading as premature.
    const t2b = setTimeout(() => setContentReady(true), 16 + 320 + 180)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t1b); clearTimeout(t2b) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    if (prefersReducedMotion()) { onClose(); return }
    setPhase('closing')
    setTimeout(onClose, 160)
  }

  const resolvedLids = useMemo(() => (
    allProducts && product.category !== 'cups'
      ? (product.compatibleLids ?? [])
          .map(s => allProducts.find(p => p.slug === s) ?? null)
          .filter((p): p is Product => p !== null)
      : []
  ), [allProducts, product])

  const name           = localizedName(product, locale)
  const derivedCapacity = deriveCapacity(product)
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
    // Header and backdrop both stay a constant z-50 (see backdrop below) — no double-dimming,
    // no side effect on other z-50 chrome like WhatsAppFAB. Only the box dips below the header
    // (z-45) while placed/flying-and-not-yet-cleared, so a card that started tucked behind the
    // sticky header stays that way instead of popping in front of it. `boxCleared` promotes it
    // early, partway through the flying transition, instead of waiting for expanding to start.
    const boxZIndex = phase === 'placed' || (phase === 'flying' && !boxCleared) ? 45 : 61
    switch (phase) {
      case 'placed':
        return { ...base, zIndex: boxZIndex, top: l.placed.top, left: l.placed.left, width: l.placed.width, height: l.placed.height, boxShadow: 'none', transition: 'none' }
      case 'flying':
        return { ...base, zIndex: boxZIndex, top: l.image.top, left: l.image.left, width: l.image.width, height: l.image.height,
          transition: `top 320ms ${EASE_OPEN}, left 320ms ${EASE_OPEN}, width 320ms ${EASE_OPEN}, height 320ms ${EASE_OPEN}` }
      case 'expanding':
        return { ...base, top: l.panel.top, left: l.panel.left, width: l.panel.width, height: l.panel.height,
          transition: `top 370ms cubic-bezier(0.2,0,0,1), left 370ms cubic-bezier(0.2,0,0,1), width 370ms cubic-bezier(0.2,0,0,1), height 370ms cubic-bezier(0.2,0,0,1)` }
      case 'open':
        return { ...base, top: l.panel.top, left: l.panel.left, width: l.panel.width, height: l.panel.height, transition: 'none' }
      case 'closing':
        return { ...base, top: l.panel.top, left: l.panel.left, width: l.panel.width, height: l.panel.height,
          transform: 'scale(0.88)', opacity: 0,
          transition: `transform 160ms ${EASE_CLOSE}, opacity 160ms ${EASE_CLOSE}` }
    }
  })()

  // Linked to the same boundary as the box's own z-45 → z-61 jump above (boxCleared or past
  // flying): the backdrop only has any business dimming things once the box has priority
  // over it, otherwise it dims the box itself right along with the page behind it.
  const backdropOpacity = boxCleared || phase === 'expanding' || phase === 'open' ? 0.6 : 0
  const contentVisible  = contentReady && phase !== 'closing'

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
      <div ref={dialogRef} tabIndex={-1} style={boxStyle} className="outline-none" role="dialog" aria-modal="true" aria-label={name}>
        <div className="flex h-full bg-white dark:bg-slate-900">

          {/* Image side — always white, no dark variant: product photos are shot
              on a white canvas regardless of site theme, so a dark placeholder
              background here would contrast against the photo instead of blending. */}
          <div
            className="relative shrink-0 overflow-hidden bg-white"
            style={
              phase === 'placed' || phase === 'flying'
                ? { width: '100%', minWidth: 0 }
                : { width: l.imgSize, minWidth: l.imgSize }
            }
          >
            <ProductImage
              key={imgIndex}
              src={images[imgIndex]}
              alt={`${name} ${imgIndex + 1}`}
              fill
              sizes="440px"
              className="object-contain p-2"
              priority
            />

            {hasMany && (
              <>
                <button onClick={prevImg} aria-label={tA11y('previousImage')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center rounded-full bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-transparent shadow text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors">
                  <ChevronIcon direction="left" />
                </button>
                <button onClick={nextImg} aria-label={tA11y('nextImage')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center rounded-full bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-transparent shadow text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors">
                  <ChevronIcon direction="right" />
                </button>

                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      aria-label={tA11y('goToImage', { n: i + 1 })}
                      aria-current={i === imgIndex}
                      className={cn(
                        // Image panel is always white regardless of theme (see comment
                        // above), so these dots stay in their light-mode colors too —
                        // a dark: swap here would render white-on-white and vanish.
                        'w-2 h-2 rounded-full transition-colors',
                        i === imgIndex ? 'bg-brand-navy' : 'bg-black/25'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Explicit 1px divider — intentional, not an artifact. */}
          <div className="w-px shrink-0 bg-gray-200 dark:bg-slate-800" />

          {/* Content side — bg-gray-50 gives it a light-mode tone distinct from
              the image side's plain white, matching how dark mode already
              contrasts white image vs slate-900 content. */}
          <div
            className="flex flex-col gap-4 p-6 min-w-0 flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900"
            style={{
              opacity:    contentVisible ? 1 : 0,
              transition: contentVisible ? 'opacity 0.14s ease' : 'none',
            }}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              aria-label={tA11y('close')}
              className="absolute top-3 end-3 z-10 p-2 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-300"
            >
              <XIcon size={16} />
            </button>

            {/* Category pill — static label, not a selection/hover state, so it doesn't
                need to match the sky-400/300/200 selected-accent scale used elsewhere. */}
            <span className="self-start text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/40 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {product.category}
            </span>

            {/* Name */}
            <h2 className="text-xl font-bold text-brand-navy dark:text-white leading-snug">
              {name}
            </h2>

            {/* Specs — material, capacity, piecesPerBox */}
            {(product.material || derivedCapacity || product.piecesPerBox) && (
              <div className="flex flex-wrap gap-2">
                {product.material && <SpecBadge>{product.material}</SpecBadge>}
                {derivedCapacity && <SpecBadge dir="ltr">{derivedCapacity}</SpecBadge>}
                {product.piecesPerBox && <SpecBadge plain>{product.piecesPerBox} pcs/box</SpecBadge>}
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
                    <ValuePill key={color.en}>
                      {locale === 'ar' ? color.ar : color.en}
                    </ValuePill>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.options.sizes && product.options.sizes.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('availableSizes')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.options.sizes.map((size) => (
                    <ValuePill key={size} dir="ltr">
                      {size}{product.options.sizeUnit ?? ''}
                    </ValuePill>
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
                    <ValuePill key={lid.slug}>
                      {localizedName(lid, locale)}
                    </ValuePill>
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
                    <ValuePill key={container.slug}>
                      {localizedName(container, locale)}
                    </ValuePill>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <Link
                href={`/products/${product.slug}`}
                onClick={handleClose}
                className={cn('flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl', button.primary)}
              >
                {tProducts('viewDetails')}
                <ArrowIcon direction={locale === 'ar' ? 'left' : 'right'} />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl', button.secondaryCta)}
              >
                <WhatsAppIcon size={15} />
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

