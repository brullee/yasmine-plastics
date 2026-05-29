import { getTranslations } from 'next-intl/server'
import { company } from '@/data/company'
import { ContactForm } from '@/components/ui/ContactForm'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const t = await getTranslations({ locale, namespace: 'contact' })

  const address = locale === 'ar' ? company.addressAr : company.addressEn
  const hours = locale === 'ar' ? company.hoursAr : company.hoursEn

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          {t('title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: contact form — primary action comes first */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('form.title')}
          </h2>
          <ContactForm />
        </div>

        {/* Right: contact info + map */}
        <div className="space-y-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 space-y-5">
            <ContactItem label={t('info.phone')}>
              <a
                href={`tel:${company.phone}`}
                dir="ltr"
                className="text-brand-navy dark:text-blue-400 hover:underline font-medium"
              >
                {company.phone}
              </a>
            </ContactItem>

            <ContactItem label={t('info.email')}>
              <a
                href={`mailto:${company.email}`}
                dir="ltr"
                className="text-brand-navy dark:text-blue-400 hover:underline font-medium"
              >
                {company.email}
              </a>
            </ContactItem>

            <ContactItem label={t('info.address')}>
              <span className="text-gray-700 dark:text-gray-300">{address}</span>
            </ContactItem>

            <ContactItem label={t('info.hours')}>
              <span className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {hours}
              </span>
            </ContactItem>
          </div>

          {/* Google Maps embed */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 h-64">
            <iframe
              title="Yasmine Plastics location"
              src={company.mapEmbedUrl}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
          <a
            href={company.mapShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-navy dark:text-sky-400 hover:underline"
          >
            {t('info.openInMaps')} →
          </a>
        </div>
      </div>
    </div>
  )
}

function ContactItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  )
}
