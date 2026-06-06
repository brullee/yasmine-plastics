'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn, buildWhatsAppUrl } from '@/lib/utils'

const CUSTOM = '__custom__'

interface Props {
  colors?: string[]
  sizes?: string[]
  lids?: string[]
  productName: string
  productSlug: string
  whatsappNumber: string
  locale: string
}

export function ProductActions({ colors, sizes, lids, productName, productSlug, whatsappNumber, locale }: Props) {
  const t = useTranslations('product')
  const tOpts = useTranslations('product.options')

  const [selectedColor, setSelectedColor] = useState<string | null>(colors?.[0] ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes?.[0] ?? null)
  const [selectedLid, setSelectedLid] = useState<string | null>(lids?.[0] ?? null)

  const colorOptions = colors ?? []
  const hasOptions = colorOptions.length > 0 || (sizes?.length ?? 0) > 0 || (lids?.length ?? 0) > 0

  // Recomputed on each render so it reflects the current selection
  const chatLines = locale === 'ar' ? [
    `مرحباً، أنا مهتم بـ: ${productName} (${productSlug})`,
    ...(selectedColor ? [`اللون: ${selectedColor === CUSTOM ? 'مخصص' : selectedColor}`] : []),
    ...(selectedSize ? [`المقاس: ${selectedSize}`] : []),
    ...(selectedLid ? [`الغطاء: ${selectedLid}`] : []),
  ] : [
    `Hi, I'm interested in: ${productName} (${productSlug})`,
    ...(selectedColor ? [`Colour: ${selectedColor === CUSTOM ? 'Custom' : selectedColor}`] : []),
    ...(selectedSize ? [`Size: ${selectedSize}`] : []),
    ...(selectedLid ? [`Lid: ${selectedLid}`] : []),
  ]
  const chatUrl = buildWhatsAppUrl(whatsappNumber, chatLines.join('\n'))

  return (
    <>
      {/* Options panel */}
      {hasOptions && (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-5 space-y-5 border border-gray-200 dark:border-gray-700">
          {colorOptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{tOpts('color')}</p>
                {selectedColor && selectedColor !== CUSTOM && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{selectedColor}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      selectedColor === color
                        ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
                    )}
                  >
                    {color}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedColor(CUSTOM)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                    selectedColor === CUSTOM
                      ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                      : 'bg-gray-50 border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-transparent dark:border-gray-500 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-200'
                  )}
                >
                  {tOpts('custom')}
                </button>
              </div>
              {selectedColor === CUSTOM && (
                <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-4 py-3">
                  <svg className="mt-0.5 shrink-0 text-amber-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{tOpts('moqNotice')}</p>
                </div>
              )}
            </div>
          )}

          {sizes && sizes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{tOpts('size')}</p>
                {selectedSize && <span className="text-sm text-gray-500 dark:text-gray-400">{selectedSize}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      selectedSize === size
                        ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lids && lids.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{tOpts('lid')}</p>
                {selectedLid && <span className="text-sm text-gray-500 dark:text-gray-400">{selectedLid}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {lids.map((lid) => (
                  <button
                    key={lid}
                    onClick={() => setSelectedLid(lid)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      selectedLid === lid
                        ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
                    )}
                  >
                    {lid}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Link
          href={(() => {
            const p = new URLSearchParams({ product: productSlug })
            if (selectedColor) p.set('color', selectedColor)
            if (selectedSize) p.set('size', selectedSize)
            if (selectedLid) p.set('lid', selectedLid)
            return `/quote?${p.toString()}`
          })()}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navyDark transition-colors"
        >
          <SendIcon />
          {t('sendInquiry')}
        </Link>
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
        >
          <WhatsAppIcon />
          {t('chatNow')}
        </a>
      </div>
    </>
  )
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
