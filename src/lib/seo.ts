export const BASE_URL = 'https://www.yasmineplastics.com'

export function pageAlternates(locale: string, path: string) {
  const arUrl = `${BASE_URL}/ar${path}`
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
