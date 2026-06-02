import { getTranslations, getLocale } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { CategoryCard } from '@/components/ui/CategoryCard'
import { categories } from '@/data/categories'
import { company } from '@/data/company'
import type { Locale } from '@/types'

function ManufacturingIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12 text-brand-navy dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="6" y1="14" x2="42" y2="14" />
      <circle cx="18" cy="14" r="4" fill="currentColor" stroke="none" />
      <line x1="6" y1="24" x2="42" y2="24" />
      <circle cx="30" cy="24" r="4" fill="currentColor" stroke="none" />
      <line x1="6" y1="34" x2="42" y2="34" />
      <circle cx="20" cy="34" r="4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YearsIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12 text-brand-navy dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="24" cy="24" r="18" />
      <polyline points="24 12 24 24 32 28" />
    </svg>
  )
}

function RangeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12 text-brand-navy dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="10" width="16" height="12" rx="2" />
      <rect x="28" y="10" width="16" height="12" rx="2" />
      <rect x="16" y="28" width="16" height="12" rx="2" />
    </svg>
  )
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const t = await getTranslations({ locale, namespace: 'home' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-navyDark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-lg hover:bg-gray-200 transition-colors text-base"
            >
              {t('hero.browseCta')}
            </Link>
            <Link
              href="/quote"
              className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-base"
            >
              {t('hero.quoteCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 bg-gray-50 dark:bg-brand-navyDeep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-brand-navy dark:text-white mb-14">
            {t('whyUs.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {(
              [
                { icon: <ManufacturingIcon />, title: t('whyUs.item1Title'), text: t('whyUs.item1Text') },
                { icon: <YearsIcon />, title: t('whyUs.item2Title'), text: t('whyUs.item2Text') },
                { icon: <RangeIcon />, title: t('whyUs.item3Title'), text: t('whyUs.item3Text') },
              ] as const
            ).map(({ icon, title, text }) => (
              <div key={title} className="flex flex-col items-center text-center gap-4">
                <div className="p-3 bg-brand-navy/10 dark:bg-brand-navy/40 rounded-full">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-brand-navy dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product categories grid — hidden until products page is ready */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-blue-300">
              {t('categories.title')}
            </h2>
            <Link
              href="/products"
              className="text-sm font-medium text-brand-blue dark:text-blue-300 hover:underline hidden sm:block"
            >
              {t('categories.viewAll')} {locale === 'ar' ? '←' : '→'}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} locale={locale} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/products"
              className="text-sm font-medium text-brand-blue dark:text-blue-300 hover:underline"
            >
              {t('categories.viewAll')} {locale === 'ar' ? '←' : '→'}
            </Link>
          </div>
        </div>
      </section> */}

{/* Bottom CTA banner */}
      <section className="py-20 bg-brand-navy/10 dark:bg-brand-navy/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white mb-4">
            {t('cta.headline')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            {t('cta.subtext')}
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center px-8 py-3.5 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-navyDark dark:bg-white dark:text-brand-navy dark:hover:bg-gray-200 transition-colors text-base"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>
      {/* Full-width map */}
      <section className="h-96 w-full">
        <iframe
          title="Yasmine Plastics location"
          src={company.mapEmbedUrl}
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full block"
        />
      </section>
    </>
  )
}
