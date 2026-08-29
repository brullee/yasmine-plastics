'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { CategoryGrid } from '@/components/ui/CategoryGrid'
import { ProductsGrid } from '@/components/ui/ProductsGrid'
import { HeroSection } from '@/components/ui/HeroSection'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CantFindBanner } from './CantFindBanner'
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
        <HeroSection title={t('title')} subtitle={t('browseByCategory')} />

        <div className="bg-gray-50 min-h-[60vh] flex flex-col">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex flex-col flex-1 gap-10">
            <h2 className="sr-only">{t('browseByCategory')}</h2>
            <CategoryGrid categories={categories} products={products} locale={locale} />
            <div className="mt-auto">
              <CantFindBanner />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <HeroSection title={categoryName ?? ''} />

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-sm text-gray-600">
          <Breadcrumb items={[{ label: tNav('products'), href: '/products' }, { label: categoryName ?? '' }]} />
          <span>
            {locale === 'ar'
              ? `عرض ${filtered.length} من كل النتائج`
              : `Showing ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 min-h-[60vh] flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col flex-1 gap-6">
          {filtered.length > 0
            ? <ProductsGrid products={filtered} allProducts={products} locale={locale} />
            : <div className="text-center py-20 text-gray-400">{t('notFound')}</div>
          }

          <div className="mt-auto pt-6">
            <CantFindBanner />
          </div>
        </div>
      </div>
    </>
  )
}
