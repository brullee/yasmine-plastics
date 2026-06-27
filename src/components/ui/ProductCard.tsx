'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn, localizedName, deriveCapacity } from '@/lib/utils'
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
      <div
        className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 pointer-events-none"
        style={{
          transform:  `scale(${bgScale.x}, ${bgScale.y})`,
          boxShadow:  hovered ? 'var(--card-shadow-hover)' : 'var(--card-shadow-idle)',
          transition: `transform ${DUR} ${EASE}, box-shadow ${DUR} ${EASE}`,
        }}
      />

      {/* ── Inner content — scales with the card expand ─────────────────── */}
      <div
        style={{
          transform:  hovered ? 'scale(1.07)' : 'scale(1)',
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
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 dark:bg-[#0d1b2a] border border-gray-200 dark:border-transparent text-brand-navy dark:text-white text-xs font-semibold rounded-full shadow transition-colors">
                <EyeIcon />
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
              'block text-sm font-medium leading-snug line-clamp-2 transition-colors duration-300',
              hovered ? 'text-brand-navy dark:text-sky-300' : 'text-brand-navy dark:text-white'
            )}
          >
            {name}
          </Link>

          {/* Specs row */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5 overflow-hidden max-h-[22px]">
            {product.material && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {product.material}
              </span>
            )}
            {derivedCapacity && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 uppercase tracking-wide" dir="ltr">
                {derivedCapacity}
              </span>
            )}
            {colorCount > 1 && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {t('colorCount', { count: colorCount })}
              </span>
            )}
            {sizeCount > 1 && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {t('sizeCount', { count: sizeCount })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}
