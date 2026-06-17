'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface Props {
  colors?: string[]
  sizes?: string[]
  lids?: string[]
  locale?: string
}

const CUSTOM = '__custom__'

export function ProductOptions({ colors, sizes, lids }: Props) {
  const t = useTranslations('product.options')
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors?.[0] ?? null
  )
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes?.[0] ?? null
  )
  const [selectedLid, setSelectedLid] = useState<string | null>(
    lids?.[0] ?? null
  )

  if (!colors?.length && !sizes?.length && !lids?.length) return null

  const colorOptions = colors ?? []

  return (
    <div className="space-y-5">
      {colorOptions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('color')}</p>
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
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
                )}
              >
                {color}
              </button>
            ))}
            {/* Custom colour option */}
            <button
              onClick={() => setSelectedColor(CUSTOM)}
              className={cn(
                'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                selectedColor === CUSTOM
                  ? 'border-brand-blue bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-white'
                  : 'border-dashed border-gray-400 text-gray-500 hover:border-gray-600 hover:text-gray-700 dark:border-gray-500 dark:text-gray-400 dark:hover:border-gray-300 dark:hover:text-gray-200'
              )}
            >
              {t('custom')}
            </button>
          </div>
          {selectedColor === CUSTOM && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-4 py-3">
              <svg className="mt-0.5 shrink-0 text-amber-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {t('moqNotice')}
              </p>
            </div>
          )}
        </div>
      )}

      {sizes && sizes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('size')}</p>
            {selectedSize && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{selectedSize}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                  selectedSize === size
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
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
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{t('lid')}</p>
            {selectedLid && (
              <span className="text-sm text-gray-500 dark:text-gray-400">{selectedLid}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {lids.map((lid) => (
              <button
                key={lid}
                onClick={() => setSelectedLid(lid)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                  selectedLid === lid
                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20 dark:text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-500 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
                )}
              >
                {lid}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
