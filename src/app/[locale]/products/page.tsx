export const revalidate = 3600

import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import { getProducts, getCategories } from '@/lib/payload-data'
import { ProductsPageClient } from '@/components/ui/ProductsPageClient'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
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
