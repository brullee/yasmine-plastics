import type { Locale } from '@/types'

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
