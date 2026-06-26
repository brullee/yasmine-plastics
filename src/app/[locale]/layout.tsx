import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter, Readex_Pro } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB'
import { BottomFade } from '@/components/BottomFade'
import { FaviconSwitcher } from '@/components/FaviconSwitcher'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansArabic = Readex_Pro({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const base = {
    metadataBase: new URL('https://www.yasmineplastics.com'),
    verification: { google: '7V2GyoQhi0QyxNQI-w8UycH-UWt0cEf9jvANLybXY9g' },
  }

  if (locale === 'ar') {
    return {
      ...base,
      title: { default: 'ياسمين للبلاستيك', template: '%s | ياسمين للبلاستيك' },
      description: 'مصنّع بلاستيك مخصص في الأردن. منتجات وقوالب وفق مواصفاتك الدقيقة. خبرة صناعية منذ 1989. نخدم الأردن والعالم العربي.',
      openGraph: { siteName: 'ياسمين للبلاستيك', locale: 'ar_JO', type: 'website' },
    }
  }

  return {
    ...base,
    title: { default: 'Yasmine Plastics', template: '%s | Yasmine Plastics' },
    description: 'Custom plastic manufacturer in Jordan. Products and molds built to your exact spec. Backed by plastics industry experience since 1989. Serving Jordan and the Arab world.',
    openGraph: { siteName: 'Yasmine Plastics', locale: 'en_US', type: 'website' },
  }
}

interface Props {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()
  const isRtl = locale === 'ar'

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${notoSansArabic.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className={`flex min-h-screen flex-col ${isRtl ? 'font-arabic' : 'font-sans'}`}>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsAppFAB locale={locale} />
              <BottomFade />
              <FaviconSwitcher />
            </div>
          </Providers>
          <Analytics />
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
