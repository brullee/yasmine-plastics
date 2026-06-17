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
    nameAr: 'علب',
    image: 'https://picsum.photos/seed/category-containers/600/400',
  },
  {
    slug: 'buckets',
    nameEn: 'Buckets',
    nameAr: 'سطول',
    image: 'https://picsum.photos/seed/category-buckets/600/400',
  },
  {
    slug: 'lids',
    nameEn: 'Lids',
    nameAr: 'أغطية',
    image: 'https://picsum.photos/seed/category-lids/600/400',
  },
  {
    slug: 'papercup-lids',
    nameEn: 'Paper Cup Lids',
    nameAr: 'أغطية الأكواب الورقية',
    image: 'https://picsum.photos/seed/category-papercup-lids/600/400',
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}
