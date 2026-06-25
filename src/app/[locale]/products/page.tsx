export const revalidate = 3600

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProducts, getCategories } from '@/lib/payload-data'
import { ProductsPageClient } from '@/components/ui/ProductsPageClient'
import { pageAlternates, BASE_URL } from '@/lib/seo'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('productsTitle')
  const description = t('productsDescription')
  return {
    title,
    description,
    alternates: pageAlternates(locale, '/products'),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/products`,
      type: 'website',
    },
  }
}

export default async function ProductsPage({ params }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  setRequestLocale(locale)

  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <Suspense>
      <ProductsPageClient products={products} categories={categories} locale={locale} />
    </Suspense>
  )
}
