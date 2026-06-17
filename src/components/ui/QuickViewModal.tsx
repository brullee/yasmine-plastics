'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { company } from '@/data/company'
import { buildWhatsAppUrl, localizedName } from '@/lib/utils'
import type { Product, Locale } from '@/types'

interface Props {
  product: Product
  locale: Locale
  onClose: () => void
}

export function QuickViewModal({ product, locale, onClose }: Props) {
  const t = useTranslations('product')
  const tProducts = useTranslations('products')
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  const name = localizedName(product, locale)

  const whatsappText = locale === 'ar'
    ? `مرحباً، أنا مهتم بـ: ${name} (${product.slug})`
    : `Hi, I'm interested in: ${name} (${product.slug})`
  const whatsappUrl = buildWhatsAppUrl(company.whatsapp, whatsappText)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Close */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 end-3 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        >
          <XIcon />
        </button>

        <div className="flex flex-col md:flex-row overflow-y-auto">
          {/* Image */}
          <div className="relative w-full md:w-5/12 shrink-0 aspect-square bg-gray-50 dark:bg-gray-800">
            <Image
              src={product.image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 p-6 md:overflow-y-auto">
            {/* Category pill */}
            <span className="self-start text-xs font-semibold text-brand-blue bg-brand-sky dark:bg-sky-900/40 dark:text-sky-300 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {product.category}
            </span>

            {/* Name */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {name}
            </h2>

            {/* Color chips */}
            {product.options.colors && product.options.colors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('availableColors')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.options.colors.map((color) => (
                    <span
                      key={color.en}
                      className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      {locale === 'ar' ? color.ar : color.en}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size chips */}
            {product.options.sizes && product.options.sizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('availableSizes')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.options.sizes.map((size) => (
                    <span
                      key={size}
                      className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-navy text-white text-sm font-semibold rounded-xl hover:bg-brand-navyDark transition-colors"
              >
                {tProducts('viewDetails')} {locale === 'ar' ? '←' : '→'}
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <WhatsAppIcon />
                {t('chatNow')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
