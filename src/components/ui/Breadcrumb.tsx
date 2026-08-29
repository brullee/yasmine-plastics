import { Fragment } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const t = useTranslations('a11y')
  return (
    <nav
      className={cn('text-sm text-gray-500 flex items-center gap-1.5', className)}
      aria-label={t('breadcrumb')}
    >
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true">›</span>}
          {item.href
            ? <Link href={item.href} className="hover:text-brand-navy transition-colors">{item.label}</Link>
            : <span className="text-gray-700" aria-current="page">{item.label}</span>
          }
        </Fragment>
      ))}
    </nav>
  )
}
