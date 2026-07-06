'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn, localizedName, deriveCapacity } from '@/lib/utils'
import { EyeIcon } from '@/components/ui/Icons'
import { SpecBadge } from '@/components/ui/SpecBadge'
import { ProductImage } from '@/components/ui/ProductImage'
import type { Product, Locale } from '@/types'

// Same fix as CategoryCard (see its NO_JITTER comment): a scaled/clipped
// element inside this card can snap slightly at the end of the hover
// transition unless forced onto a stable GPU layer. Tried stacking more
// aggressive hacks on top (a permanent sub-pixel rotate, transform-gpu,
// perspective) — none of them reliably fixed the remaining stutter and one
// introduced a new edge artifact, so this stays at the two standard,
// well-understood properties rather than accumulating more speculative ones.
// Residual jitter in some browser/mode combinations is accepted, not fixed.
const NO_JITTER = 'will-change-transform [backface-visibility:hidden]'

// Approximates the old JS-computed "grow by a fixed 40px regardless of card
// size" background bleed ((width+40)/width) with real per-breakpoint ratios
// from this grid's actual card widths (ProductsGrid: 2/3/4 cols), since a
// single flat scale reads as noticeably weaker on the smaller card sizes.
const SHADOW_SCALE = '[@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:group-hover:scale-[1.23] sm:[@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:group-hover:scale-[1.17] lg:[@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:group-hover:scale-[1.14]'

interface Props {
  product: Product
  locale: Locale
  onQuickView?: (product: Product, originRect: DOMRect) => void
  priority?: boolean
}

export function ProductCard({ product, locale, onQuickView, priority = false }: Props) {
  const t    = useTranslations('products')
  const name = localizedName(product, locale)

  const imgRef = useRef<HTMLDivElement>(null)

  const colorCount    = product.options.colors?.length ?? 0
  const sizeCount     = product.options.sizes?.length ?? 0
  const derivedCapacity = deriveCapacity(product)

  return (
    <div className="group relative hover:z-10 rounded-xl bg-white dark:bg-slate-800">
      {/* ── Nectar background-color-expand ───────────────────────────────── */}
      {/* Base layer: static idle shadow, only transform animates */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl bg-white dark:bg-slate-800 pointer-events-none scale-100',
          SHADOW_SCALE,
          'transition-transform duration-500 ease-[cubic-bezier(.2,.75,.5,1)]',
          NO_JITTER,
        )}
        style={{ boxShadow: 'var(--card-shadow-idle)' }}
      />
      {/* Hover shadow layer: opacity-only transition avoids per-frame repaint */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl pointer-events-none scale-100 opacity-0',
          SHADOW_SCALE,
          '[@media(hover:hover)]:group-hover:opacity-100',
          'transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.75,.5,1)]',
          NO_JITTER,
        )}
        style={{ boxShadow: 'var(--card-shadow-hover)' }}
      />

      {/* ── Inner content — scales with the card expand ─────────────────── */}
      <div
        className={cn(
          'scale-100 [@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:group-hover:scale-[1.07]',
          'transition-transform duration-500 ease-[cubic-bezier(.2,.75,.5,1)]',
          NO_JITTER,
        )}
      >
        {/* Image section */}
        <div className="relative">
          {/* Link covers the image — click navigates to product page */}
          <Link href={`/products/${product.slug}`} className="block">
            <div
              ref={imgRef}
              className="relative aspect-square overflow-hidden bg-white dark:bg-slate-800 rounded-xl isolate"
            >
              <ProductImage
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
              className={cn(
                'absolute bottom-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy dark:focus-visible:ring-sky-400 rounded-full',
                'opacity-0 pointer-events-none transition-opacity duration-75',
                '[@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:duration-500',
                'focus:opacity-100 focus:pointer-events-auto focus:duration-500',
                NO_JITTER,
              )}
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
              'text-brand-navy dark:text-white [@media(hover:hover)]:group-hover:dark:text-sky-300',
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
