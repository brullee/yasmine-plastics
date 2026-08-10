'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { text, bg, border, button } from '@/lib/theme'

// Next.js inserts this as the error boundary around `{children}` in
// [locale]/layout.tsx — Header/Footer/WhatsAppFAB stay mounted, only the
// page content underneath is replaced. Falls back to global-error.tsx
// (which also loses the header/footer) only if the layout itself throws.
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className={cn('rounded-xl border p-8', bg.distinctPanel, border.divider)}>
        <h1 className={cn('text-xl font-bold', text.heading)}>{t('heading')}</h1>
        <p className={cn('mt-2', text.body)}>{t('message')}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className={cn('rounded-lg px-5 py-2.5 text-sm font-semibold', button.primary)}
          >
            {t('retry')}
          </button>
          <Link
            href="/"
            className={cn('rounded-lg px-5 py-2.5 text-sm font-semibold', button.secondaryCta)}
          >
            {t('home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
