import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ProductsPage({ params }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const t = await getTranslations({ locale, namespace: 'products' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-brand-navy dark:text-white mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      {/* WIP notice */}
      <div className="mb-8 rounded-xl bg-brand-sky dark:bg-brand-navyDark px-5 py-4 flex items-start gap-3">
        <p className="text-sm text-brand-navy dark:text-gray-300">{t('wipNotice')}</p>
      </div>

      {/* Custom order callout */}
      <div className="rounded-xl bg-brand-navy dark:bg-[#002952] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white text-lg mb-1">
            {t('customBanner.title')}
          </p>
          <p className="text-blue-200 text-sm">
            {t('customBanner.text')}
          </p>
        </div>
        <Link
          href="/contact"
          className="flex-shrink-0 px-5 py-2.5 bg-white text-brand-navy text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          {tNav('contact')}
        </Link>
      </div>
    </div>
  )
}
