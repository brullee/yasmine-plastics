'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface Props {
  colors?: string[]
  sizes?: string[]
}

export function ProductOptions({ colors, sizes }: Props) {
  const t = useTranslations('product.options')
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors?.[0] ?? null
  )
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes?.[0] ?? null
  )

  if (!colors?.length && !sizes?.length) return null

  return (
    <div className="space-y-5">
      {colors && colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('color')}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-sm font-medium transition-colors',
                  selectedColor === color
                    ? 'border-brand-navy bg-brand-navy text-white dark:border-blue-400 dark:bg-blue-900/50 dark:text-blue-200'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-navy dark:hover:border-blue-400'
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes && sizes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('size')}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-sm font-medium transition-colors',
                  selectedSize === size
                    ? 'border-brand-navy bg-brand-navy text-white dark:border-blue-400 dark:bg-blue-900/50 dark:text-blue-200'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-brand-navy dark:hover:border-blue-400'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
