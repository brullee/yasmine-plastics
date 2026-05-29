import { getTranslations } from 'next-intl/server'
import { QuoteForm } from '@/components/ui/QuoteForm'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ product?: string }>
}

export default async function QuotePage({ params, searchParams }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const { product } = await searchParams
  const t = await getTranslations({ locale, namespace: 'quote' })

  const initialProduct = product ?? ''

  const steps = [
    t('step1'),
    t('step2'),
    t('step3'),
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start">
        {/* Form — takes 2/3 width */}
        <div className="lg:col-span-2">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t('title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          <QuoteForm initialProduct={initialProduct} />
        </div>

        {/* Sidebar — what happens next */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-brand-sky dark:bg-blue-950 rounded-2xl p-6">
            <h2 className="text-base font-bold text-brand-navy dark:text-white mb-5 uppercase tracking-wide">
              {t('stepsTitle')}
            </h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-navy text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-blue-200 pt-0.5 leading-relaxed">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
