import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { text, bg, border, button } from '@/lib/theme'

// Catches notFound() calls from pages nested under [locale] (e.g. an invalid
// product slug) — rendered inside [locale]/layout.tsx, so Header/Footer and
// the html/body/lang/dir it sets up stay intact. Does NOT catch notFound()
// thrown by [locale]/layout.tsx itself (invalid locale) — that falls through
// to the root app/not-found.tsx instead, same rule as error.tsx boundaries.
export default async function LocaleNotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className={cn('rounded-xl border p-8', bg.distinctPanel, border.divider)}>
        <h1 className={cn('text-xl font-bold', text.heading)}>{t('heading')}</h1>
        <p className={cn('mt-2', text.body)}>{t('message')}</p>
        <div className="mt-6">
          <Link
            href="/"
            className={cn('inline-block rounded-lg px-5 py-2.5 text-sm font-semibold', button.primary)}
          >
            {t('home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
