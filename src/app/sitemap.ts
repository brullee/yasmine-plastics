export const revalidate = 3600

import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/payload-data'
import { localeUrl } from '@/lib/seo'

const locales = ['ar', 'en'] as const

const staticPages = [
  { path: '', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/products', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/quote', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts()
  const now = new Date()

  const staticEntries = staticPages.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified: now,
      changeFrequency,
      priority,
    }))
  )

  const productEntries = products.flatMap((product) =>
    locales.map((locale) => ({
      url: localeUrl(locale, `/products/${product.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  return [...staticEntries, ...productEntries]
}
