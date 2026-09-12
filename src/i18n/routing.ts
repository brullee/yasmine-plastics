import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
  localeDetection: false,
  localePrefix: 'as-needed',
  // Without an explicit maxAge, next-intl's own router (any call passing { locale })
  // writes the cookie with no expiry — a session cookie a visitor loses the moment they
  // close their browser, silently reverting an explicit language choice back to Arabic
  // on their next visit. path is pinned so it's always set for the whole site, not
  // scoped to whichever locale-prefixed path the switch happened to happen on.
  localeCookie: { maxAge: 60 * 60 * 24 * 365, path: '/' },
})

export type Locale = (typeof routing.locales)[number]
