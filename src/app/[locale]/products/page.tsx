export const revalidate = 3600

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProducts, getCategories } from '@/lib/payload-data'
import { ProductsPageClient } from './_components/ProductsPageClient'
import { pageAlternates, localeUrl, brandName } from '@/lib/seo'
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
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, '/products'),
    openGraph: {
      title,
      description,
      url: localeUrl(locale, '/products'),
      type: 'website',
      siteName: brandName(locale),
    },
  }
}

// `ProductsPageClient` reads `?category=` via `useSearchParams()`, which forces this
// Suspense boundary to bail to client-side rendering on this statically-generated page
// (see PLAN.md Pending). Reserving the same shape/height here keeps the swap-in from
// jumping the footer, since the boundary would otherwise render nothing at all until
// hydration. Can't know here whether the real content will be CategoryGrid's cards
// (no `?category=`) or ProductsGrid's cards (filtered) — the search param isn't
// readable yet at this point — so this renders a generic card grid (square image +
// two text-line bars, same shape either card style boils down to) rather than trying
// to precisely match one specific card's decorative details.
function ProductsPageSkeleton() {
  return (
    <>
      <div className="bg-brand-navy dark:bg-brand-navyDeep border-b border-brand-navyDark dark:border-gray-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-9 w-56 mx-auto rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-950 min-h-[60vh]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-wrap justify-center gap-5 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)]">
                <div className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="mt-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default async function ProductsPage({ params }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  setRequestLocale(locale)

  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageClient products={products} categories={categories} locale={locale} />
    </Suspense>
  )
}
