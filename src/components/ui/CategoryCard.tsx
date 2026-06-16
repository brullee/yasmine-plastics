import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { Category } from '@/types'
import type { Locale } from '@/types'
import { cn, localizedName } from '@/lib/utils'

interface Props {
  category: Category
  locale: Locale
  className?: string
}

export function CategoryCard({ category, locale, className }: Props) {
  const t = useTranslations('products')
  const name = localizedName(category, locale)

  return (
    <Link href={`/products?category=${category.slug}`}>
      <article className={cn('group relative h-48 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer', className)}>
        <Image
          src={category.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Default gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:opacity-0 transition-opacity duration-300" />
        {/* Hover: solid brand overlay */}
        <div className="absolute inset-0 bg-brand-navy opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
          <p className="text-white font-bold text-xl">{name}</p>
          <p className="text-blue-200 text-sm font-medium">{t('viewProducts')}</p>
        </div>
        {/* Default name label */}
        <div className="absolute bottom-0 inset-x-0 p-4 group-hover:opacity-0 transition-opacity duration-300">
          <p className="text-white font-semibold text-base">{name}</p>
        </div>
      </article>
    </Link>
  )
}
