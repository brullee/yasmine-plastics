import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { Product } from '@/types'
import type { Locale } from '@/types'
import { localizedName } from '@/lib/utils'

interface Props {
  product: Product
  locale: Locale
}

export function ProductCard({ product, locale }: Props) {
  const t = useTranslations('products')
  const name = localizedName(product, locale)

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white dark:bg-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700"
    >
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        <Image
          src={product.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <span className="inline-block text-xs font-semibold text-brand-blue bg-brand-sky dark:bg-sky-900/40 dark:text-sky-300 px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
          {product.category}
        </span>
        <h3 className="font-semibold text-brand-navy dark:text-white text-base leading-snug mb-3">
          {name}
        </h3>
        <span className="text-sm font-medium text-brand-blue dark:text-sky-400 group-hover:underline">
          {t('viewDetails')} {locale === 'ar' ? '←' : '→'}
        </span>
      </div>
    </Link>
  )
}
