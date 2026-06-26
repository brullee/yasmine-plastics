import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ProductsGrid } from '@/components/ui/ProductsGrid'
import { ProductMainSection } from '@/components/ui/ProductMainSection'
import { getProductBySlug, getProducts, getCategoryBySlug } from '@/lib/payload-data'
import { company } from '@/data/company'
import { localizedName } from '@/lib/utils'
import { pageAlternates, localeUrl } from '@/lib/seo'
import type { Locale } from '@/types'

export const revalidate = 3600

export async function generateStaticParams() {
  if (process.env.NODE_ENV === 'development') return []
  const products = await getProducts()
  return (['en', 'ar'] as const).flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug }))
  )
}

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const name = locale === 'ar' ? product.nameAr : product.nameEn
  const category = await getCategoryBySlug(product.category)
  const categoryName = category
    ? (locale === 'ar' ? category.nameAr : category.nameEn)
    : product.category

  const description = locale === 'ar'
    ? `${name}. ${categoryName} من ياسمين للبلاستيك.${product.material ? ` مصنوع من ${product.material}.` : ''} اطلب عرض سعر للطلبات الصناعية والجملة.`
    : `${name}. ${categoryName} by Yasmine Plastics.${product.material ? ` Made from ${product.material}.` : ''} Request a wholesale or bulk order quote.`

  const brand = locale === 'ar' ? 'ياسمين للبلاستيك' : 'Yasmine Plastics'
  const fullTitle = `${name} - ${brand}`

  return {
    title: { absolute: fullTitle },
    description,
    alternates: pageAlternates(locale, `/products/${slug}`),
    openGraph: {
      title: fullTitle,
      description,
      url: localeUrl(locale, `/products/${slug}`),
      type: 'website',
      images: product.image ? [{ url: product.image, width: 1400, height: 1400, alt: name }] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale: localeRaw, slug } = await params
  const locale = localeRaw as Locale
  setRequestLocale(locale)
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

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: product.image || undefined,
    description: locale === 'ar'
      ? `${name}. ${categoryName} من ياسمين للبلاستيك`
      : `${name}. ${categoryName} by Yasmine Plastics`,
    brand: { '@type': 'Brand', name: 'Yasmine Plastics' },
    ...(product.material ? { material: product.material } : {}),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/PreOrder',
      priceCurrency: 'JOD',
      seller: { '@type': 'Organization', name: 'Yasmine Plastics' },
    },
  }

  return (
    <div className="bg-gray-50 dark:bg-brand-navyDeep min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
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
            <ProductsGrid products={related} allProducts={allProducts} locale={locale} />
          </section>
        )}

      </div>
    </div>
  )
}
