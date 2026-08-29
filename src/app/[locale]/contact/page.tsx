import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { company } from '@/data/company'
import { ContactForm } from './_components/ContactForm'
import { pageAlternates, localeUrl, BASE_URL, brandName } from '@/lib/seo'
import type { Locale } from '@/types'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const title = t('contactTitle')
  const description = t('contactDescription')
  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, '/contact'),
    openGraph: {
      title,
      description,
      url: localeUrl(locale, '/contact'),
      type: 'website',
      siteName: brandName(locale),
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale: localeRaw } = await params
  const locale = localeRaw as Locale
  const t = await getTranslations({ locale, namespace: 'contact' })

  const address = locale === 'ar' ? company.addressAr : company.addressEn
  const hours = locale === 'ar' ? company.hoursAr : company.hoursEn

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Yasmine Plastics',
    url: BASE_URL,
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.addressEn,
      addressLocality: 'Amman',
      addressCountry: 'JO',
    },
    openingHours: 'Sa-Th 08:00-17:00',
    hasMap: company.mapShareUrl,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, '\\u003c') }}
      />
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-brand-navy mb-3">
          {t('title')}
        </h1>
        <p className="text-gray-500 text-lg mb-2">{t('subtitle')}</p>
        <p className="text-sm text-gray-400">{t('priceNote')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: contact form - primary action comes first */}
        <div>
          <ContactForm />
        </div>

        {/* Right: contact info + map */}
        <div className="flex flex-col gap-8">
          <div className="bg-gray-100 rounded-2xl p-6 space-y-5">
            <ContactItem label={t('info.phone')}>
              <div className="flex flex-col gap-1">
                <a href={`tel:${company.phone}`} dir="ltr" className="text-brand-navy hover:underline font-medium rtl:self-start inline-block">{company.phone}</a>
                <a href={`tel:${company.phone2}`} dir="ltr" className="text-brand-navy hover:underline font-medium rtl:self-start inline-block">{company.phone2}</a>
              </div>
            </ContactItem>

            <ContactItem label={t('info.email')}>
              <a
                href={`mailto:${company.email}`}
                dir="ltr"
                className="text-brand-navy hover:underline font-medium"
              >
                {company.email}
              </a>
            </ContactItem>

            <ContactItem label={t('info.address')}>
              <span className="text-gray-700">{address}</span>
            </ContactItem>

            <ContactItem label={t('info.hours')}>
              <span className="text-gray-700 whitespace-pre-line">
                {hours}
              </span>
            </ContactItem>
          </div>

          {/* Google Maps embed */}
          <div className="flex-1 min-h-48 rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <iframe
              title="Yasmine Plastics location"
              src={company.mapEmbedUrl + `&hl=${locale === 'ar' ? 'ar' : 'en'}`}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
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
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  )
}
