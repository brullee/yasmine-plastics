import { CategoryCard } from '@/components/ui/CategoryCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import type { Category, Product, Locale } from '@/types'

const CARD_WIDTH = 'w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)]'

interface Props {
  categories: Category[]
  products: Product[]
  locale: Locale
  reveal?: boolean
}

// Flex-wrap instead of a fixed grid so a category count that isn't a multiple
// of 4 centers its last row instead of leaving a card orphaned flush-left.
export function CategoryGrid({ categories, products, locale, reveal = false }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-5">
      {categories.map((cat, i) => {
        const card = (
          <CategoryCard
            category={cat}
            locale={locale}
            productCount={products.filter((p) => p.category === cat.slug).length}
          />
        )
        return reveal ? (
          <ScrollReveal key={cat.slug} direction="up" delay={i * 80} className={CARD_WIDTH}>
            {card}
          </ScrollReveal>
        ) : (
          <div key={cat.slug} className={CARD_WIDTH}>
            {card}
          </div>
        )
      })}
    </div>
  )
}
