import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HtmlAttributes } from '@/components/HtmlAttributes'
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB'
import { BottomFade } from '@/components/BottomFade'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '../globals.css'

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
    <>
      <HtmlAttributes locale={locale} />
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`flex min-h-screen flex-col ${isRtl ? 'font-arabic' : 'font-sans'}`}
          >
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppFAB locale={locale} />
            <BottomFade />
          </div>
          <Analytics />
          <SpeedInsights />
        </Providers>
      </NextIntlClientProvider>
    </>
  )
}
