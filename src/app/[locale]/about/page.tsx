import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'

type SectionKey = 'story' | 'mission' | 'vision' | 'values'

const sections: SectionKey[] = ['story', 'mission', 'vision', 'values']

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
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-10 text-center">
        {t('title')}
      </h1>

      {/* Credibility stats — visible immediately, before scrolling */}
      <div className="grid grid-cols-3 gap-4 mb-16 bg-brand-sky dark:bg-blue-950 rounded-2xl p-8">
        {(
          [
            { value: t('stat1Value'), label: t('stat1Label') },
            { value: t('stat2Value'), label: t('stat2Label') },
            { value: t('stat3Value'), label: t('stat3Label') },
          ] as const
        ).map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-brand-navy dark:text-white mb-1" dir="ltr">
              {value}
            </p>
            <p className="text-sm text-gray-600 dark:text-blue-300">{label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-14">
        {sections.map((key, index) => (
          <section key={key}>
            <div className="flex items-start gap-5">
              <span
                className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-navy text-white text-lg font-bold flex items-center justify-center"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {t(`${key}.title`)}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base md:text-lg">
                  {t(`${key}.body`)}
                </p>
              </div>
            </div>
            {index < sections.length - 1 && (
              <div className="mt-14 border-t border-gray-200 dark:border-gray-800" />
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
