import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ProductActions } from '@/components/ui/ProductActions'
import { ProductCard } from '@/components/ui/ProductCard'
import { getProductBySlug, getProductsByCategory, products } from '@/data/products'
import { getCategoryBySlug } from '@/data/categories'
import { company } from '@/data/company'
import { localizedName } from '@/lib/utils'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale: localeRaw, slug } = await params
  const locale = localeRaw as Locale
  const product = getProductBySlug(slug)

  if (!product) notFound()

  const t = await getTranslations({ locale, namespace: 'product' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  const name = localizedName(product, locale)
  const category = getCategoryBySlug(product.category)
  const categoryName = category ? localizedName(category, locale) : product.category

  // Lid selector: resolve compatible lid names for non-cup products
  const compatibleLidNames = product.category !== 'cups' && product.compatibleLids
    ? product.compatibleLids
        .map((s) => {
          const lid = products.find((p) => p.slug === s)
          return lid ? { slug: s, name: localizedName(lid, locale) } : null
        })
        .filter((l): l is { slug: string; name: string } => l !== null)
    : []

  // Reverse relationship: if this IS a lid, find which containers list it
  const fitsContainers = (product.category === 'lids' || product.category === 'papercup-lids')
    ? products
        .filter((p) => p.compatibleLids?.includes(product.slug))
        .map((p) => ({ slug: p.slug, name: localizedName(p, locale) }))
    : []

  // Related products: same category, exclude self, max 3
  const related = getProductsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
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

      {/* Main grid: image left, info right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

        {/* ── Left: Image ── */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800 shadow-md">
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* ── Right: Info ── */}
        <div className="space-y-6">

          {/* Name (+ ART code above if available) */}
          <div>
            {product.artCode && (
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 font-mono">
                {product.artCode}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white leading-tight">
              {name}
            </h1>
          </div>

          {/* Category pill */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5">
            <span className="text-gray-500 dark:text-gray-400 text-sm">{t('category')}:</span>
            <span className="text-gray-900 dark:text-white font-semibold text-sm">{categoryName}</span>
          </div>

          <ProductActions
            colors={product.options.colors}
            sizes={product.options.sizes}
            lids={compatibleLidNames.map((l) => l.name)}
            productName={name}
            productSlug={product.slug}
            whatsappNumber={company.whatsapp}
            locale={locale}
          />

          {/* Fits with (for lid products) */}
          {fitsContainers.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('fitsContainers')}</p>
              <div className="flex flex-wrap gap-2">
                {fitsContainers.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/products/${c.slug}`}
                    className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:border-brand-navy hover:text-brand-navy dark:hover:border-brand-blue dark:hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Key attributes */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              {t('keyAttributes')}
            </h2>
            <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {[
                { label: t('material'), value: product.material },
                { label: t('capacity'), value: product.capacity },
                { label: t('piecesPerBox'), value: product.piecesPerBox?.toString() },
                { label: t('dimensions'), value: product.dimensions },
                { label: t('cbm'), value: product.cbm },
                ...(product.options.sizes?.length ? [{ label: t('availableSizes'), value: product.options.sizes.join(', ') }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="bg-white dark:bg-gray-800 px-4 py-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {value ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

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

