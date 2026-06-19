'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { CategoryCard } from '@/components/ui/CategoryCard'
import { ProductsGrid } from '@/components/ui/ProductsGrid'
import { localizedName } from '@/lib/utils'
import type { Product, Category, Locale } from '@/types'

interface Props {
  products: Product[]
  categories: Category[]
  locale: Locale
}

export function ProductsPageClient({ products, categories, locale }: Props) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')
  const t = useTranslations('products')
  const tNav = useTranslations('nav')

  const activeCat = categories.find((c) => c.slug === activeCategory)
  const categoryName = activeCat ? localizedName(activeCat, locale) : activeCategory
  const filtered = activeCategory ? products.filter((p) => p.category === activeCategory) : []

  if (!activeCategory) {
    return (
      <>
        <div className="bg-brand-navy dark:bg-brand-navyDeep border-b border-brand-navyDark dark:border-gray-700 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('title')}</h1>
            <p className="text-white/60">{t('browseByCategory')}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-950 min-h-[60vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <CategoryCard key={cat.slug} category={cat} locale={locale} className="h-64" />
              ))}
            </div>

            <div className="mt-10 rounded-xl border-2 border-dashed border-brand-navy/40 dark:border-slate-600 bg-blue-50 dark:bg-slate-800 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="font-semibold text-brand-navy dark:text-white text-base mb-1">{t('cantFind.title')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('cantFind.text')}</p>
              </div>
              <Link href="/contact" className="shrink-0 px-6 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navyDark transition-colors">
                {t('cantFind.cta')}
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="bg-brand-navy dark:bg-brand-navyDeep border-b border-brand-navyDark dark:border-gray-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{categoryName}</h1>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-brand-navyDeep border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/products" className="hover:text-brand-navy dark:hover:text-white transition-colors">
              {tNav('products')}
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-gray-900 dark:text-gray-300">{categoryName}</span>
          </nav>
          <span>
            {locale === 'ar'
              ? `عرض ${filtered.length} من كل النتائج`
              : `Showing ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-950 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="rounded-xl border-2 border-dashed border-brand-navy/40 dark:border-slate-600 bg-blue-50 dark:bg-slate-800 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-brand-navy dark:text-white text-sm mb-0.5">{t('cantFind.title')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">{t('cantFind.text')}</p>
            </div>
            <Link href="/contact" className="shrink-0 px-5 py-2 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navyDark transition-colors">
              {t('cantFind.cta')}
            </Link>
          </div>

          {filtered.length > 0
            ? <ProductsGrid products={filtered} locale={locale} />
            : <div className="text-center py-20 text-gray-400 dark:text-gray-500">{t('notFound')}</div>
          }

          {filtered.length > 6 && (
            <div className="rounded-xl border-2 border-dashed border-brand-navy/40 dark:border-slate-600 bg-blue-50 dark:bg-slate-800 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-brand-navy dark:text-white text-sm mb-0.5">{t('cantFind.title')}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{t('cantFind.text')}</p>
              </div>
              <Link href="/contact" className="shrink-0 px-5 py-2 bg-brand-navy text-white text-xs font-semibold rounded-lg hover:bg-brand-navyDark transition-colors">
                {t('cantFind.cta')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
