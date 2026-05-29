import type { Category } from '@/types'

export const categories: Category[] = [
  {
    slug: 'cups',
    nameEn: 'Cups',
    nameAr: 'أكواب',
    image: 'https://picsum.photos/seed/category-cups/600/400',
  },
  {
    slug: 'containers',
    nameEn: 'Containers',
    nameAr: 'حاويات',
    image: 'https://picsum.photos/seed/category-containers/600/400',
  },
  {
    slug: 'specialty',
    nameEn: 'Specialty',
    nameAr: 'منتجات أخرى',
    image: 'https://picsum.photos/seed/category-specialty/600/400',
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}
