'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { Product, Locale } from '@/types'
import { localizedName } from '@/lib/utils'

interface Props {
  product: Product
  locale: Locale
  onQuickView?: (product: Product) => void
  priority?: boolean
}

export function ProductCard({ product, locale, onQuickView, priority = false }: Props) {
  const t = useTranslations('products')
  const name = localizedName(product, locale)

  return (
    <div className="group relative z-0 hover:z-10">
      <Link
        href={`/products/${product.slug}`}
        className="block bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:shadow-xl border border-gray-200 dark:border-slate-700 group-hover:scale-[1.06] transition-all duration-300 ease-in-out"
      >
        {/* Image */}
        <div className="relative aspect-square bg-white dark:bg-slate-700 rounded-t-xl overflow-hidden p-2">
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain"
            priority={priority}
          />
        </div>

        {/* Name + actions - fixed height, no layout shift */}
        <div className="border-t border-gray-100 dark:border-slate-700 px-3 pt-2.5 pb-1 rounded-b-xl">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-snug">
            {name}
          </h3>

          {/* Always in flow (no height change), just fades in */}
          <div className="flex items-center justify-center gap-4 pt-2 pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product) }}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-navy dark:hover:text-white transition-colors"
              >
                <span className="text-brand-navy dark:text-brand-sky"><EyeIcon /></span>
                {t('quickView')}
              </button>
            )}
            <span className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <span className="text-emerald-500"><ViewIcon /></span>
              {t('viewDetails')}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ViewIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
