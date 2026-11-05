'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import type { Category, Locale } from '@/types'
import { cn, localizedName } from '@/lib/utils'
import { formatArabicCount } from '@/lib/i18n'
import { ProductImage } from '@/components/ui/ProductImage'

interface Props {
  category: Category
  locale: Locale
  productCount?: number
  className?: string
}

// Chromium/Firefox subpixel-rounding bug: anything painted inside this card's
// overflow-hidden + border-radius container can snap slightly at the end of
// the hover transition, whether or not the element has a transform of its
// own — children just along for the parent's ride are affected too. Forcing
// a stable GPU layer (will-change + backface-visibility) on every element in
// the subtree helps, applied everywhere below. Tried stacking more aggressive
// hacks on top (a permanent sub-pixel rotate, transform-gpu, a 3D perspective
// context) — none of them reliably fixed the remaining stutter in every
// browser/mode combination, so this stops at the two standard, well-
// understood properties rather than accumulating more speculative ones.
// (Tailwind scans raw source text, not resolved JS — this constant is safe
// because it's one complete, static string; the `[@media(...)]:` variants
// below must stay fully inline or Tailwind won't generate the CSS for them.)
const NO_JITTER = 'will-change-transform [backface-visibility:hidden]'

export function CategoryCard({ category, locale, productCount, className }: Props) {
  const name = localizedName(category, locale)
  const [imageFailed, setImageFailed] = useState(false)
  const noPhoto = !category.image || imageFailed

  const count = productCount !== undefined
    ? locale === 'ar'
      ? formatArabicCount(productCount, { one: 'منتج واحد', two: 'منتجان', few: 'منتجات', many: 'منتجاً', other: 'منتج' })
      : productCount === 1 ? '1 product' : `${productCount} products`
    : null

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn(
        'group block',
        NO_JITTER,
        '[@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:hover:scale-[1.05]',
        'transition-transform duration-500 ease-out',
        className,
      )}
    >
      <div className="relative aspect-square">
        {/* Shadow lives on its own layers, separate from the clipped content below —
            a box-shadow needs to extend past the element's bounds, which overflow-hidden
            would cut off. Cross-fading opacity between two fixed shadows (instead of
            animating box-shadow's blur/spread directly) avoids forcing a repaint every
            frame — animating box-shadow is expensive; opacity is GPU-composited. Same
            --card-shadow-* variables as ProductCard, so this also gets a real dark-mode
            shadow instead of the same flat black shadow in both modes. */}
        <div
          className={cn('absolute inset-0 rounded-xl pointer-events-none', NO_JITTER)}
          style={{ boxShadow: 'var(--card-shadow-idle)' }}
        />
        <div
          className={cn(
            'absolute inset-0 rounded-xl pointer-events-none opacity-0',
            '[@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-500 ease-out',
            NO_JITTER,
          )}
          style={{ boxShadow: 'var(--card-shadow-hover)' }}
        />

        {/* Hover tint = photo at 30% over a navy background, the same color as a navy/70 overlay.
            A separate overlay layer didn't line up with the photo's edges and let its white show. */}
        <div className={cn(
          'absolute inset-0 rounded-xl overflow-hidden',
          noPhoto ? 'bg-white' : '[@media(hover:hover)]:group-hover:bg-brand-navy transition-colors duration-500 ease-out',
          NO_JITTER,
        )}>

          {/* Image zooms inside the fixed container */}
          {category.image && (
            <ProductImage
              src={category.image}
              alt={name}
              fill
              onFail={() => setImageFailed(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={cn(
                'object-cover',
                NO_JITTER,
                '[@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:group-hover:scale-110',
                !noPhoto && '[@media(hover:hover)]:group-hover:opacity-30',
                'transition-[transform,opacity] duration-500 ease-out',
              )}
            />
          )}

          {/* No photo to fade, so the white fallback keeps a plain overlay tint. */}
          {noPhoto && (
            <div className="absolute inset-0 bg-brand-navy/70 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-500 ease-out" />
          )}

          {/* Text */}
          <div className={cn('absolute bottom-0 inset-x-0 z-10 px-5 pb-5 pt-3', NO_JITTER)}>
            <h3 className={cn(
              'font-bold text-xl leading-snug',
              NO_JITTER,
              'text-brand-navy [@media(hover:hover)]:group-hover:text-white',
              '[@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:translate-y-6 [@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:group-hover:translate-y-0',
              'transition-[color,transform] duration-500 ease-out',
            )}>
              {name}
            </h3>
            {count && (
              <span className={cn(
                'text-sm font-medium block',
                NO_JITTER,
                'text-brand-navy/60 [@media(hover:hover)]:group-hover:text-white/80',
                'opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100',
                'transition-[color,opacity] duration-300 ease-out',
              )}>
                {count}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
