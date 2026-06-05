import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
