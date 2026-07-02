export const BASE_URL = 'https://www.yasmineplastics.com'

export function brandName(locale: string) {
  return locale === 'en' ? 'Yasmine Plastics' : 'ياسمين للبلاستيك'
}

export function localeUrl(locale: string, path: string = '') {
  return locale === 'ar' ? `${BASE_URL}${path}` : `${BASE_URL}/en${path}`
}

export function pageAlternates(locale: string, path: string) {
  const arUrl = `${BASE_URL}${path}`
  const enUrl = `${BASE_URL}/en${path}`
  return {
    canonical: locale === 'ar' ? arUrl : enUrl,
    languages: {
      ar: arUrl,
      en: enUrl,
      'x-default': arUrl,
    },
  }
}
