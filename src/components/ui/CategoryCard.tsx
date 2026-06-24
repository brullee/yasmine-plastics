import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Category, Locale } from '@/types'
import { cn, localizedName } from '@/lib/utils'

interface Props {
  category: Category
  locale: Locale
  productCount?: number
  className?: string
}

export function CategoryCard({ category, locale, productCount, className }: Props) {
  const name = localizedName(category, locale)

  return (
    <Link href={`/products?category=${category.slug}`} className="group relative block">
      {/* Shadow lives here — outside overflow-hidden, never clipped */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-[350ms] [transition-timing-function:cubic-bezier(.15,.75,.5,1)]"
        style={{ boxShadow: '0 30px 70px rgba(0,0,0,.25)' }}
      />

      <article className={cn('relative aspect-square rounded-xl overflow-hidden cursor-pointer', className)}>
        {/* Background image */}
        <Image
          src={category.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover scale-100 group-hover:scale-110 transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(.15,.75,.5,1)] [backface-visibility:hidden]"
        />

        {/* Overlay: subtle dark default → navy on hover */}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-brand-navy/75 transition-[background-color] duration-[450ms] [transition-timing-function:cubic-bezier(.15,.75,.5,1)]" />

        {/* Centered text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-10 px-6 text-center">
          <h3 className="text-white font-bold text-xl leading-snug drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] translate-y-[14px] group-hover:translate-y-0 transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(.15,.75,.5,1)]">
            {name}
          </h3>
          {productCount !== undefined && (
            <span className="text-white/90 text-base font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-[450ms] [transition-timing-function:cubic-bezier(.15,.75,.5,1)]">
              {locale === 'ar'
                ? productCount === 1 ? 'منتج واحد' : productCount === 2 ? 'منتجان' : `${productCount} منتجات`
                : productCount === 1 ? 'product' : productCount === 2 ? 'products' : `${productCount} products`}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
