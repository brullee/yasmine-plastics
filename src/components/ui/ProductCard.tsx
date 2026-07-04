'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn, localizedName, deriveCapacity, prefersReducedMotion } from '@/lib/utils'
import { EyeIcon } from '@/components/ui/Icons'
import { SpecBadge } from '@/components/ui/SpecBadge'
import type { Product, Locale } from '@/types'

const EASE = 'cubic-bezier(.2,.75,.5,1)'
const DUR  = '500ms'

interface Props {
  product: Product
  locale: Locale
  onQuickView?: (product: Product, originRect: DOMRect) => void
  priority?: boolean
}

export function ProductCard({ product, locale, onQuickView, priority = false }: Props) {
  const t    = useTranslations('products')
  const name = localizedName(product, locale)

  const cardRef    = useRef<HTMLDivElement>(null)
  const imgRef     = useRef<HTMLDivElement>(null)
  const hoveredRef = useRef(false)
  const [hovered, setHovered] = useState(false)
  const [bgScale, setBgScale] = useState({ x: 1, y: 1 })

  const onEnter = () => {
    if (hoveredRef.current) return
    if (!window.matchMedia('(hover: hover)').matches) return
    hoveredRef.current = true
    setHovered(true)
    if (prefersReducedMotion()) return
    const el = cardRef.current
    if (el) setBgScale({ x: (el.offsetWidth + 40) / el.offsetWidth, y: (el.offsetHeight + 40) / el.offsetHeight })
  }
  const onLeave = () => {
    hoveredRef.current = false
    setHovered(false)
    setBgScale({ x: 1, y: 1 })
  }
  // Re-triggers card hover after a QuickView modal closes with cursor already over the card
  const onMove = () => { if (!hoveredRef.current) onEnter() }

  const colorCount    = product.options.colors?.length ?? 0
  const sizeCount     = product.options.sizes?.length ?? 0
  const derivedCapacity = deriveCapacity(product)

  return (
    <div
      ref={cardRef}
      className="relative"
      style={{ zIndex: hovered ? 10 : 0 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      {/* ── Nectar background-color-expand ───────────────────────────────── */}
      {/* Base layer: static idle shadow, only transform animates */}
      <div
        className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 pointer-events-none"
        style={{
          transform:  `scale(${bgScale.x}, ${bgScale.y})`,
          boxShadow:  'var(--card-shadow-idle)',
          transition: `transform ${DUR} ${EASE}`,
        }}
      />
      {/* Hover shadow layer: opacity-only transition avoids per-frame repaint */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          transform:  `scale(${bgScale.x}, ${bgScale.y})`,
          boxShadow:  'var(--card-shadow-hover)',
          opacity:    hovered ? 1 : 0,
          transition: `transform ${DUR} ${EASE}, opacity ${DUR} ${EASE}`,
        }}
      />

      {/* ── Inner content — scales with the card expand ─────────────────── */}
      <div
        style={{
          transform:  hovered && !prefersReducedMotion() ? 'scale(1.07)' : 'scale(1)',
          transition: `transform ${DUR} ${EASE}`,
        }}
      >
        {/* Image section */}
        <div className="relative">
          {/* Link covers the image — click navigates to product page */}
          <Link href={`/products/${product.slug}`} className="block">
            <div
              ref={imgRef}
              className="relative aspect-square overflow-hidden bg-white dark:bg-slate-800 rounded-xl isolate"
            >
              <Image
                src={product.image}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-2 rounded-xl"
                priority={priority}
              />
            </div>
          </Link>

          {/* Quick View pill — OUTSIDE the Link so clicking it never navigates */}
          {onQuickView && (
            <button
              type="button"
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
              style={{
                opacity:       hovered ? 1 : 0,
                pointerEvents: hovered ? 'auto' : 'none',
                transition:    hovered ? `opacity ${DUR} ${EASE}` : 'opacity 80ms ease',
              }}
              onClick={() => {
                const rect = imgRef.current?.getBoundingClientRect()
                if (rect) onQuickView(product, rect)
              }}
            >
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 dark:bg-brand-slate750 border border-gray-200 dark:border-slate-600 text-brand-navy dark:text-white text-xs font-semibold rounded-full shadow transition-colors">
                <EyeIcon size={12} strokeWidth={2.5} />
                {t('quickView')}
              </span>
            </button>
          )}
        </div>

        {/* Meta area */}
        <div className="px-3 pt-2.5 pb-3">
          <Link
            href={`/products/${product.slug}`}
            className={cn(
              'block text-base font-bold leading-snug line-clamp-2 transition-colors duration-300',
              hovered ? 'text-brand-navy dark:text-sky-300' : 'text-brand-navy dark:text-white'
            )}
          >
            {name}
          </Link>

          {/* Specs row */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5 overflow-hidden max-h-[22px]">
            {product.material && (
              <SpecBadge compact>{product.material}</SpecBadge>
            )}
            {derivedCapacity && (
              <SpecBadge compact dir="ltr">{derivedCapacity}</SpecBadge>
            )}
            {colorCount > 1 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t('colorCount', { count: colorCount })}
              </span>
            )}
            {sizeCount > 1 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t('sizeCount', { count: sizeCount })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

