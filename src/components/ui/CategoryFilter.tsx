'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import type { Category } from '@/types'
import type { Locale } from '@/types'
import { cn, localizedName } from '@/lib/utils'

interface Props {
  categories: Category[]
  activeCategory: string | null
}

export function CategoryFilter({ categories, activeCategory }: Props) {
  const t = useTranslations('products')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function setCategory(slug: string | null) {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      <button
        onClick={() => setCategory(null)}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          activeCategory === null
            ? 'bg-brand-navy text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
      >
        {t('allCategories')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => setCategory(cat.slug)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            activeCategory === cat.slug
              ? 'bg-brand-navy text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          {localizedName(cat, locale)}
        </button>
      ))}
    </div>
  )
}
