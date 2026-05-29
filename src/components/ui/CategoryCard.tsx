import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Category } from '@/types'
import type { Locale } from '@/types'
import { localizedName } from '@/lib/utils'

interface Props {
  category: Category
  locale: Locale
}

export function CategoryCard({ category, locale }: Props) {
  const name = localizedName(category, locale)

  return (
    <Link href={`/products?category=${category.slug}`}>
      <article className="group relative h-48 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
        <Image
          src={category.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-4">
          <p className="text-white font-semibold text-base">{name}</p>
        </div>
      </article>
    </Link>
  )
}
