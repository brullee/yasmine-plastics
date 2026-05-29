import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HtmlAttributes } from '@/components/HtmlAttributes'
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB'
import '../globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
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
          </div>
        </Providers>
      </NextIntlClientProvider>
    </>
  )
}
