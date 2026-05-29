import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ProductCard } from '@/components/ui/ProductCard'
import { CategoryFilter } from '@/components/ui/CategoryFilter'
import { products } from '@/data/products'
import { categories } from '@/data/categories'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const { category } = await searchParams
  const t = await getTranslations({ locale, namespace: 'products' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const activeCategory = category ?? null

  const filtered =
    activeCategory
      ? products.filter((p) => p.category === activeCategory)
      : products

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryFilter categories={categories} activeCategory={activeCategory} />
      </div>

      {/* Custom order callout */}
      <div className="mb-10 rounded-xl bg-brand-sky dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-brand-navy dark:text-blue-200 text-lg mb-1">
            {t('customBanner.title')}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('customBanner.text')}
          </p>
        </div>
        <Link
          href="/contact"
          className="flex-shrink-0 px-5 py-2.5 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-colors"
        >
          {tNav('contact')}
        </Link>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-16">
          {t('notFound')}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
