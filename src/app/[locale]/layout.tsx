import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter, Tajawal } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB'
import { BottomFade } from '@/components/BottomFade'
import { FaviconSwitcher } from '@/components/FaviconSwitcher'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansArabic = Tajawal({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '500', '700'],
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

  if (locale === 'ar') {
    return {
      title: { default: 'ياسمين للبلاستيك', template: '%s | ياسمين للبلاستيك' },
      description: 'منتجات بلاستيكية وقوالب، مصنّعة وفق المواصفات منذ عام 1989. نخدم الأردن والعالم العربي.',
    }
  }

  return {
    title: { default: 'Yasmine Plastics', template: '%s | Yasmine Plastics' },
    description: 'Plastic products and molds, manufactured to spec since 1989. Serving Jordan and the Arab world.',
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
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
