import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { pageAlternates, localeUrl, brandName } from '@/lib/seo'
import type { Locale } from '@/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('aboutTitle')
  const description = t('aboutDescription')
  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, '/about'),
    openGraph: {
      title,
      description,
      url: localeUrl(locale, '/about'),
      type: 'website',
      siteName: brandName(locale),
    },
  }
}

type SectionKey = 'story' | 'mission' | 'vision' | 'values'

const sections: SectionKey[] = ['story', 'mission', 'vision', 'values']

const cardStyles: { bg: string; title: string; body: string }[] = [
  { bg: 'bg-gradient-to-br from-brand-navy to-brand-navyDark', title: 'text-white',                      body: 'text-blue-200' },
  { bg: 'bg-[#d3e2ef] shadow-[0_6px_24px_rgba(0,0,0,.15)]', title: 'text-brand-navy', body: 'text-gray-600' },
  { bg: 'bg-gradient-to-br from-brand-navy to-brand-navyDark', title: 'text-white',                      body: 'text-blue-200' },
  { bg: 'bg-[#d3e2ef] shadow-[0_6px_24px_rgba(0,0,0,.15)]', title: 'text-brand-navy', body: 'text-gray-600' },
]

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* Page title */}
      <h1 className="text-4xl md:text-5xl font-bold text-brand-navy mb-10 text-center">
        {t('title')}
      </h1>

      {/* Section cards */}
      <div className="space-y-6">
        {sections.map((key, index) => {
          const { bg, title, body } = cardStyles[index]
          return (
            <section key={key} className={`${bg} rounded-2xl px-8 py-10 md:px-12 md:py-12`}>
              <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${title}`}>
                {t(`${key}.title`)}
              </h2>
              <p className={`leading-relaxed text-base md:text-lg ${body}`}>
                {t(`${key}.body`)}
              </p>
            </section>
          )
        })}
      </div>
    </div>
  )
}
