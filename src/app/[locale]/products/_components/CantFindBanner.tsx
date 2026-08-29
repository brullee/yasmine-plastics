'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { button } from '@/lib/theme'

export function CantFindBanner() {
  const t = useTranslations('products')
  return (
    <div className="rounded-xl border-2 border-dashed border-brand-navy/40 bg-blue-50 px-6 py-5 flex items-end justify-between gap-6">
      <div>
        <p className="font-semibold text-brand-navy text-sm mb-1">{t('cantFind.title')}</p>
        <p className="text-sm text-gray-600">{t('cantFind.text')}</p>
      </div>
      <Link
        href="/contact"
        className={cn('shrink-0 px-5 py-2 text-sm font-semibold rounded-lg', button.primary)}
      >
        {t('cantFind.cta')}
      </Link>
    </div>
  )
}
