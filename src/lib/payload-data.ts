import { getPayload as _getPayload } from 'payload'
import type { BasePayload } from 'payload'
import config from '@payload-config'
import type { Product, Category } from '@/types'

const g = global as typeof globalThis & { __payload?: BasePayload }

async function getPayload(): Promise<BasePayload> {
  if (!g.__payload) {
    g.__payload = await _getPayload({ config })
    if (process.env.VERCEL) {
      try {
        const { attachDatabasePool } = await import('@vercel/functions')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pool = (g.__payload.db as any).pool
        if (pool) attachDatabasePool(pool)
      } catch {}
    }
  }
  return g.__payload
}

function mediaUrl(media: unknown): string {
  if (!media) return ''
  if (typeof media === 'string') return media
  if (typeof media === 'object' && media !== null) {
    const m = media as Record<string, unknown>
    if (m.url && typeof m.url === 'string') {
      // Strip origin for local files so Next.js doesn't block private IPs
      if (m.url.includes('/api/media/file/')) {
        try { return new URL(m.url).pathname } catch { return m.url }
      }
      return m.url
    }
    if (m.filename && typeof m.filename === 'string')
      return `/api/media/file/${encodeURIComponent(m.filename as string)}`
  }
  return ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProduct(doc: any): Product {
  const categoryObj = typeof doc.category === 'object' ? doc.category : null
  const category = categoryObj?.slug ?? (doc.category ?? '')
  const categoryNameEn = categoryObj?.nameEn ?? category
  const categoryNameAr = categoryObj?.nameAr ?? category

  const compatibleLids: string[] = []
  const pairingImages: Record<string, string[]> = {}

  // Declared directly on the product (Options tab) — no paired photo required.
  for (const lid of doc.compatibleLidOptions ?? []) {
    const lidSlug = typeof lid === 'object' ? lid?.slug : null
    if (lidSlug && !compatibleLids.includes(lidSlug)) compatibleLids.push(lidSlug)
  }

  for (const g of doc.gallery ?? []) {
    const lidSlug = typeof g.pairedLid === 'object' ? g.pairedLid?.slug : null
    if (!lidSlug) continue
    if (!compatibleLids.includes(lidSlug)) compatibleLids.push(lidSlug)
    const url = mediaUrl(g.image)
    if (url && g.showInLidGallery !== false) {
      if (!pairingImages[lidSlug]) pairingImages[lidSlug] = []
      pairingImages[lidSlug].push(url)
    }
  }

  const colorImageMap: Record<string, string> = {}
  const sizeImageMap: Record<string, string> = {}

  function addToMap(color: unknown, size: unknown, url: string) {
    const nameEn = typeof color === 'object' && color !== null ? (color as Record<string, string>).nameEn : null
    if (nameEn && !colorImageMap[nameEn]) colorImageMap[nameEn] = url
    const label = typeof size === 'object' && size !== null ? (size as Record<string, string>).label : null
    if (label && !sizeImageMap[label]) sizeImageMap[label] = url
  }

  // Main image associations (index 0 in the carousel)
  const mainUrl = mediaUrl(doc.image)
  if (mainUrl) addToMap(doc.mainImageLinkedColors, doc.mainImageLinkedSizes, mainUrl)

  // Gallery image associations
  for (const g of doc.gallery ?? []) {
    const url = mediaUrl(g.image)
    if (url) addToMap(g.linkedColors, g.linkedSizes, url)
  }

  return {
    slug: doc.slug ?? '',
    nameEn: doc.nameEn ?? '',
    nameAr: doc.nameAr ?? '',
    internalName: doc.internalName,
    category,
    categoryNameEn,
    categoryNameAr,
    options: {
      colors: (() => {
        const arr = (doc.colors ?? [])
          .filter((c: unknown) => c && typeof c === 'object')
          .map((c: unknown) => {
            const color = c as Record<string, string>
            return { en: color.nameEn ?? '', ar: color.nameAr || (color.nameEn ?? '') }
          })
          .filter((c: { en: string; ar: string }) => c.en) as { en: string; ar: string }[]
        const mainColorEn =
          typeof doc.mainImageLinkedColors === 'object' && doc.mainImageLinkedColors !== null
            ? (doc.mainImageLinkedColors as Record<string, string>).nameEn
            : null
        if (mainColorEn) {
          const idx = arr.findIndex((c: { en: string; ar: string }) => c.en === mainColorEn)
          if (idx > 0) arr.unshift(arr.splice(idx, 1)[0])
        }
        return arr
      })(),
      sizes: (() => {
        const arr = (doc.sizes ?? [])
          .filter((s: unknown) => s && typeof s === 'object')
          .map((s: unknown) => (s as { label: string }).label)
          .filter(Boolean) as string[]
        const mainSizeLabel =
          typeof doc.mainImageLinkedSizes === 'object' && doc.mainImageLinkedSizes !== null
            ? (doc.mainImageLinkedSizes as Record<string, string>).label
            : null
        if (mainSizeLabel) {
          const idx = arr.findIndex((s: string) => s === mainSizeLabel)
          if (idx > 0) arr.unshift(arr.splice(idx, 1)[0])
        }
        return arr
      })(),
      sizeUnit: typeof doc.sizeUnit === 'object' && doc.sizeUnit !== null
        ? ((doc.sizeUnit as Record<string, unknown>).label as string | undefined)
        : (doc.sizeUnit ?? undefined),
      colorImageMap: Object.keys(colorImageMap).length ? colorImageMap : undefined,
      sizeImageMap: Object.keys(sizeImageMap).length ? sizeImageMap : undefined,
    },
    compatibleLids: compatibleLids.length ? compatibleLids : undefined,
    pairingImages: Object.keys(pairingImages).length ? pairingImages : undefined,
    image: mediaUrl(doc.image),
    gallery: (doc.gallery ?? []).map((g: { image: unknown }) => mediaUrl(g.image)).filter(Boolean),
    artCode: doc.artCode,
    material: typeof doc.material === 'object' && doc.material !== null ? (doc.material.name ?? undefined) : undefined,
    capacityAutoGenerate: doc.capacityAutoGenerate ?? true,
    capacity: doc.capacity,
    piecesPerBox: doc.piecesPerBox,
    shapeType: doc.shapeType,
    diameterTop: doc.diameterTop,
    tapered: doc.tapered,
    diameterBottom: doc.diameterBottom,
    width: doc.width,
    length: doc.length,
    height: doc.height,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCategory(doc: any): Category {
  return {
    slug: doc.slug ?? '',
    nameEn: doc.nameEn ?? '',
    nameAr: doc.nameAr ?? '',
    image: mediaUrl(doc.image),
  }
}

export async function getProducts(): Promise<Product[]> {
  const p = await getPayload()
  const result = await p.find({ collection: 'products', limit: 1000, depth: 2 })
  return result.docs.map(transformProduct).filter((p) => !!p.slug)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const p = await getPayload()
  const result = await p.find({ collection: 'products', where: { slug: { equals: slug } }, depth: 2, limit: 1 })
  return result.docs[0] ? transformProduct(result.docs[0]) : null
}

export async function getCategories(): Promise<Category[]> {
  const p = await getPayload()
  const result = await p.find({ collection: 'categories', depth: 1, limit: 100 })
  return result.docs.map(transformCategory)
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const p = await getPayload()
  const result = await p.find({ collection: 'categories', where: { slug: { equals: slug } }, depth: 1, limit: 1 })
  return result.docs[0] ? transformCategory(result.docs[0]) : undefined
}
