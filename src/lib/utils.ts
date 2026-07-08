import type { Locale, Product } from '@/types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function localizedName(
  item: { nameEn: string; nameAr: string },
  locale: Locale
): string {
  return locale === 'ar' ? item.nameAr : item.nameEn
}


export function buildWhatsAppUrl(phone: string, message?: string): string {
  const clean = phone.replace(/[^0-9]/g, '')
  const encoded = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${encoded}`
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function deriveCapacityParts(
  product: Pick<Product, 'capacity' | 'capacityAutoGenerate' | 'options'>
): { range: string; unit: string } | undefined {
  if (product.capacityAutoGenerate === false) {
    const raw = product.capacity?.replace(/\s*-\s*/g, '-').replace(/\s+/g, '')
    if (!raw) return undefined
    const match = raw.match(/^([\d.,/-]+)(.*)$/)
    return match ? { range: match[1], unit: match[2] } : { range: raw, unit: '' }
  }
  const sizes = product.options.sizes
  const unit = product.options.sizeUnit ?? ''
  if (!sizes?.length) return undefined
  const nums = sizes.map(s => parseFloat(s)).filter(n => !isNaN(n)).sort((a, b) => a - b)
  if (!nums.length) return undefined
  const range = nums.length === 1 ? `${nums[0]}` : `${nums[0]}-${nums[nums.length - 1]}`
  return { range, unit }
}

export function deriveCapacity(
  product: Pick<Product, 'capacity' | 'capacityAutoGenerate' | 'options'>
): string | undefined {
  const parts = deriveCapacityParts(product)
  return parts ? `${parts.range}${parts.unit}` : undefined
}
