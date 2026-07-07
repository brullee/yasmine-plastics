export const revalidate = 3600

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { QuoteForm } from './_components/QuoteForm'
import { getProducts, getCategories } from '@/lib/payload-data'
import { pageAlternates, localeUrl, brandName } from '@/lib/seo'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('quoteTitle')
  const description = t('quoteDescription')
  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, '/quote'),
    openGraph: {
      title,
      description,
      url: localeUrl(locale, '/quote'),
      type: 'website',
      siteName: brandName(locale),
    },
  }
}

export default async function QuotePage({ params }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  setRequestLocale(locale)

  const [t, products, categories] = await Promise.all([
    getTranslations({ locale, namespace: 'quote' }),
    getProducts(),
    getCategories(),
  ])

  const steps = [t('step1'), t('step2'), t('step3')]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-2">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-brand-navy dark:text-white mb-3">{t('title')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2">{t('subtitle')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-400">{t('priceNote')}</p>
          </div>
          <Suspense>
            <QuoteForm products={products} categories={categories} />
          </Suspense>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="bg-brand-navy/10 dark:bg-brand-navy/20 rounded-2xl p-6">
            <h2 className="text-base font-bold text-brand-navy dark:text-white mb-5 uppercase tracking-wide">
              {t('stepsTitle')}
            </h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-navy text-white dark:bg-white dark:text-brand-navy text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
