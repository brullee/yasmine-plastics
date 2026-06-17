import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductMainSection } from '@/components/ui/ProductMainSection'
import { getProductBySlug, getProducts, getCategoryBySlug } from '@/lib/payload-data'
import { company } from '@/data/company'
import { localizedName } from '@/lib/utils'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale: localeRaw, slug } = await params
  const locale = localeRaw as Locale
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ])

  if (!product) notFound()

  const t = await getTranslations({ locale, namespace: 'product' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const name = localizedName(product, locale)
  const category = await getCategoryBySlug(product.category)
  const categoryName = category ? localizedName(category, locale) : product.category

  const compatibleLids = product.category !== 'cups' && product.compatibleLids
    ? product.compatibleLids
        .map((s) => allProducts.find((p) => p.slug === s) ?? null)
        .filter((p): p is NonNullable<typeof p> => p !== null)
    : []

  const fitsContainers = (product.category === 'lids' || product.category === 'papercup-lids')
    ? allProducts.filter((p) => p.compatibleLids?.includes(product.slug))
    : []

  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4)

  return (
    <div className="bg-gray-50 dark:bg-brand-navyDeep min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 dark:text-gray-500 mb-8 flex items-center gap-1.5">
          <Link href="/products" className="hover:text-brand-navy dark:hover:text-white transition-colors">
            {tNav('products')}
          </Link>
          <span>›</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-brand-navy dark:hover:text-white transition-colors"
          >
            {categoryName}
          </Link>
          <span>›</span>
          <span className="text-gray-700 dark:text-gray-300">{name}</span>
        </nav>

        <ProductMainSection
          product={product}
          name={name}
          categoryName={categoryName}
          compatibleLids={compatibleLids}
          fitsContainers={fitsContainers}
          whatsappNumber={company.whatsapp}
          locale={locale}
        />

        {/* Related items */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
              {t('relatedItems')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} locale={locale} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
