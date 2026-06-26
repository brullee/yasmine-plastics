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

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function deriveCapacity(
  product: Pick<Product, 'capacity' | 'capacityAutoGenerate' | 'options'>
): string | undefined {
  if (product.capacityAutoGenerate === false) return product.capacity || undefined
  const sizes = product.options.sizes
  const unit = product.options.sizeUnit ?? ''
  if (!sizes?.length) return undefined
  const nums = sizes.map(s => parseFloat(s)).filter(n => !isNaN(n)).sort((a, b) => a - b)
  if (!nums.length) return undefined
  if (nums.length === 1) return `${nums[0]}${unit}`
  return `${nums[0]}-${nums[nums.length - 1]}${unit}`
}
