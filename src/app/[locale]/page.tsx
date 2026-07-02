import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { CategoryCard } from '@/components/ui/CategoryCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { MapEmbed } from '@/components/ui/MapEmbed'
import { company } from '@/data/company'
import { pageAlternates, localeUrl, BASE_URL, brandName } from '@/lib/seo'
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

function ShapesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 7.5L12 2.25L3 7.5M21 7.5L12 12.75M21 7.5V16.5L12 21.75M3 7.5L12 12.75M3 7.5V16.5L12 21.75M12 12.75V21.75" />
    </svg>
  )
}

function MoldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11.4194 15.1694L17.25 21C18.2855 22.0355 19.9645 22.0355 21 21C22.0355 19.9645 22.0355 18.2855 21 17.25L15.1233 11.3733M11.4194 15.1694L13.9155 12.1383C14.2315 11.7546 14.6542 11.5132 15.1233 11.3733M11.4194 15.1694L6.76432 20.8219C6.28037 21.4096 5.55897 21.75 4.79768 21.75C3.39064 21.75 2.25 20.6094 2.25 19.2023C2.25 18.441 2.59044 17.7196 3.1781 17.2357L10.0146 11.6056M15.1233 11.3733C15.6727 11.2094 16.2858 11.1848 16.8659 11.2338C16.9925 11.2445 17.1206 11.25 17.25 11.25C19.7353 11.25 21.75 9.23528 21.75 6.75C21.75 6.08973 21.6078 5.46268 21.3523 4.89779L18.0762 8.17397C16.9605 7.91785 16.0823 7.03963 15.8262 5.92397L19.1024 2.64774C18.5375 2.39223 17.9103 2.25 17.25 2.25C14.7647 2.25 12.75 4.26472 12.75 6.75C12.75 6.87938 12.7555 7.00749 12.7662 7.13411C12.8571 8.20956 12.6948 9.39841 11.8617 10.0845L11.7596 10.1686M10.0146 11.6056L5.90901 7.5H4.5L2.25 3.75L3.75 2.25L7.5 4.5V5.90901L11.7596 10.1686M10.0146 11.6056L11.7596 10.1686M18.375 18.375L15.75 15.75M4.86723 19.125H4.87473V19.1325H4.86723V19.125Z" />
    </svg>
  )
}

function ColorsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.09835 19.9017C5.56282 21.3661 7.93719 21.3661 9.40165 19.9017L15.8033 13.5M6.75 21C4.67893 21 3 19.3211 3 17.25V4.125C3 3.50368 3.50368 3 4.125 3H9.375C9.99632 3 10.5 3.50368 10.5 4.125V8.1967M6.75 21C8.82107 21 10.5 19.3211 10.5 17.25V8.1967M6.75 21H19.875C20.4963 21 21 20.4963 21 19.875V14.625C21 14.0037 20.4963 13.5 19.875 13.5H15.8033M10.5 8.1967L13.3791 5.31757C13.8185 4.87823 14.5308 4.87823 14.9701 5.31757L18.6824 9.02988C19.1218 9.46922 19.1218 10.1815 18.6824 10.6209L15.8033 13.5M6.75 17.25H6.7575V17.2575H6.75V17.25Z" />
    </svg>
  )
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.53086 16.1224C9.08517 15.0243 8.00801 14.25 6.75 14.25C5.09315 14.25 3.75 15.5931 3.75 17.25C3.75 18.4926 2.74262 19.5 1.49998 19.5C1.44928 19.5 1.39898 19.4983 1.34912 19.495C2.12648 20.8428 3.58229 21.75 5.24998 21.75C7.72821 21.75 9.73854 19.7467 9.74993 17.2711C9.74998 17.2641 9.75 17.2571 9.75 17.25C9.75 16.8512 9.67217 16.4705 9.53086 16.1224ZM9.53086 16.1224C10.7252 15.7153 11.8612 15.1705 12.9175 14.5028M7.875 14.4769C8.2823 13.2797 8.8281 12.1411 9.49724 11.0825M12.9175 14.5028C14.798 13.3141 16.4259 11.7362 17.6806 9.85406L21.5566 4.04006C21.6827 3.85093 21.75 3.6287 21.75 3.40139C21.75 2.76549 21.2345 2.25 20.5986 2.25C20.3713 2.25 20.1491 2.31729 19.9599 2.44338L14.1459 6.31937C12.2638 7.57413 10.6859 9.20204 9.49724 11.0825M12.9175 14.5028C12.2396 12.9833 11.0167 11.7604 9.49724 11.0825" />
    </svg>
  )
}

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
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
                  className="inline-flex items-center px-7 py-3 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-navyDark dark:bg-white dark:text-brand-navy dark:hover:bg-gray-200 transition-colors text-base"
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
                { icon: <ManufacturingIcon />, title: t('whyUs.item1Title'), text: t('whyUs.item1Text'), dir: 'left'  },
                { icon: <YearsIcon />,         title: t('whyUs.item2Title'), text: t('whyUs.item2Text'), dir: 'up'    },
                { icon: <RangeIcon />,          title: t('whyUs.item3Title'), text: t('whyUs.item3Text'), dir: 'right' },
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

      {/* Product categories grid - hidden until products page is ready */}
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
      <section className="py-20 bg-sky-50 dark:bg-brand-navy/40">
        <ScrollReveal direction="up">
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
        </ScrollReveal>
      </section>
      <MapEmbed locale={locale} />
    </>
  )
}
