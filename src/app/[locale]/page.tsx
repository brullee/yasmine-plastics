export const revalidate = 3600

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CategoryGrid } from '@/components/ui/CategoryGrid'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { MapEmbed } from '@/components/ui/MapEmbed'
import { company } from '@/data/company'
import { pageAlternates, localeUrl, BASE_URL, brandName } from '@/lib/seo'
import { getProducts, getCategories } from '@/lib/payload-data'
import { ShapesIcon, MoldIcon, ColorsIcon, PrintIcon, ManufacturingIcon, YearsIcon, RangeIcon } from '@/components/ui/Icons'
import type { Locale } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('homeTitle')
  const description = t('homeDescription')
  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, ''),
    openGraph: {
      title,
      description,
      url: localeUrl(locale),
      type: 'website',
      siteName: brandName(locale),
    },
  }
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
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Yasmine Plastics',
    url: BASE_URL,
    logo: `${BASE_URL}/YasmineLogo.svg`,
    telephone: company.phone,
    email: company.email,
    foundingDate: '2008',
    description: 'Manufacturer of plastic cups, containers, lids, and custom plastic products in Jordan.',
    areaServed: [
      { '@type': 'Country', name: 'Jordan' },
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'Country', name: 'Iraq' },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.addressEn,
      addressLocality: 'Amman',
      addressCountry: 'JO',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema).replace(/</g, '\\u003c') }}
      />
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
              className="px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-lg hover:bg-gray-300 transition-colors text-base"
            >
              {t('hero.browseCta')}
            </Link>
            <Link
              href="/quote"
              className="px-8 py-3.5 border-2 border-white text-white font-semibold rounded-lg hover:bg-black/10 transition-colors text-base"
            >
              {t('hero.quoteCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Custom manufacturing emphasis */}
      <section className="py-20 bg-brand-navy/10 dark:bg-brand-navy/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-brand-navy dark:text-blue-300 mb-4">
                  {t('custom.eyebrow')}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white mb-5 leading-tight">
                  {t('custom.headline')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                  {t('custom.body')}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-7 py-3 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-navyHover dark:bg-white dark:text-brand-navy dark:hover:bg-gray-300 transition-colors text-base"
                >
                  {t('custom.cta')}
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { icon: <ShapesIcon />, title: t('custom.tile1Title'), text: t('custom.tile1Text') },
                  { icon: <MoldIcon />,   title: t('custom.tile2Title'), text: t('custom.tile2Text') },
                  { icon: <ColorsIcon />, title: t('custom.tile3Title'), text: t('custom.tile3Text') },
                  { icon: <PrintIcon />,  title: t('custom.tile4Title'), text: t('custom.tile4Text') },
                ] as const
              ).map(({ icon, title, text }, i) => (
                <ScrollReveal key={title} direction="up" delay={i * 80}>
                  <div className="p-5 bg-white dark:bg-brand-navy/40 rounded-xl h-full">
                    <div className="mb-3 text-brand-navy dark:text-blue-300">{icon}</div>
                    <h3 className="font-semibold text-brand-navy dark:text-white mb-1 text-sm">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 bg-white dark:bg-brand-navyDeep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-brand-navy dark:text-white mb-14">
            {t('whyUs.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {(
              [
                { icon: <ManufacturingIcon className="w-12 h-12 text-brand-navy dark:text-blue-300" />, title: t('whyUs.item1Title'), text: t('whyUs.item1Text'), dir: 'left'  },
                { icon: <YearsIcon         className="w-12 h-12 text-brand-navy dark:text-blue-300" />, title: t('whyUs.item2Title'), text: t('whyUs.item2Text'), dir: 'up'    },
                { icon: <RangeIcon         className="w-12 h-12 text-brand-navy dark:text-blue-300" />, title: t('whyUs.item3Title'), text: t('whyUs.item3Text'), dir: 'right' },
              ] as const
            ).map(({ icon, title, text, dir }, i) => (
              <ScrollReveal key={title} direction={dir} delay={i * 100}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-3 bg-brand-navy/10 dark:bg-brand-navy/40 rounded-full">
                    {icon}
                  </div>
                  <h3 className="text-xl font-semibold text-brand-navy dark:text-white">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Product categories grid */}
      <section className="py-20 bg-brand-navy/10 dark:bg-brand-navy/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-brand-navy dark:text-white mb-14">
            {t('categories.title')}
          </h2>
          <CategoryGrid categories={categories} products={products} locale={locale} reveal />
        </div>
      </section>

{/* Bottom CTA banner */}
      <section className="py-20 bg-gradient-to-br from-brand-navy to-brand-navyDark">
        <ScrollReveal direction="up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('cta.headline')}
            </h2>
            <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
              {t('cta.subtext')}
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center px-8 py-3.5 bg-white text-brand-navy font-semibold rounded-lg hover:bg-gray-300 transition-colors text-base"
            >
              {t('cta.button')}
            </Link>
          </div>
        </ScrollReveal>
      </section>
      <MapEmbed locale={locale} />
    </>
  )
}
