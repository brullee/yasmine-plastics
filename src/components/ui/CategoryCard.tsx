import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Category, Locale } from '@/types'
import { cn, localizedName } from '@/lib/utils'
import { formatArabicCount } from '@/lib/i18n'

interface Props {
  category: Category
  locale: Locale
  productCount?: number
  className?: string
}

export function CategoryCard({ category, locale, productCount, className }: Props) {
  const name = localizedName(category, locale)

  const count = productCount !== undefined
    ? locale === 'ar'
      ? formatArabicCount(productCount, { one: 'منتج واحد', two: 'منتجان', few: 'منتجات', many: 'منتجاً', other: 'منتج' })
      : productCount === 1 ? '1 product' : `${productCount} products`
    : null

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn(
        'group block',
        '[@media(hover:hover)]:hover:scale-[1.05]',
        'transition-transform duration-500 ease-out',
        className,
      )}
    >
      {/* overflow-hidden + border-radius lives here and never transforms */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,.12)] [@media(hover:hover)]:group-hover:shadow-[0_20px_60px_rgba(0,0,0,.30)] transition-shadow duration-500 ease-out">

        {/* Image zooms inside the fixed container */}
        {category.image && (
          <Image
            src={category.image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover [@media(hover:hover)]:group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        )}

        {/* Navy tint */}
        <div className="absolute inset-0 bg-brand-navy/70 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-500 ease-out" />

        {/* Text */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-5 pb-5 pt-3">
          <h3 className={cn(
            'font-bold text-xl leading-snug',
            'text-brand-navy [@media(hover:hover)]:group-hover:text-white',
            '[@media(hover:hover)]:translate-y-6 [@media(hover:hover)]:group-hover:translate-y-0',
            'transition-[color,transform] duration-500 ease-out',
          )}>
            {name}
          </h3>
          {count && (
            <span className={cn(
              'text-sm font-medium block',
              'text-brand-navy/60 [@media(hover:hover)]:group-hover:text-white/80',
              'opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100',
              'transition-[color,opacity] duration-300 ease-out',
            )}>
              {count}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
