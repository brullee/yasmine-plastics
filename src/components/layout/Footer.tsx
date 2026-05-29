'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import { company } from '@/data/company'

const NAV_LINKS = [
  { key: 'home' as const, href: '/' },
  { key: 'about' as const, href: '/about' },
  { key: 'products' as const, href: '/products' },
  { key: 'contact' as const, href: '/contact' },
  { key: 'quote' as const, href: '/quote' },
] as const

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function Footer() {
  const t = useTranslations()
  const locale = useLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const address = locale === 'ar' ? company.addressAr : company.addressEn
  const isDark = mounted && resolvedTheme === 'dark'

  function toggleLocale() {
    router.replace(pathname, { locale: locale === 'en' ? 'ar' : 'en' })
  }

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: brand + contact info */}
          <div className="space-y-4">
            <p className="text-gray-900 dark:text-white font-bold text-xl">Yasmine Plastics</p>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-400 dark:text-gray-500">{t('contact.info.phone')}: </span>
                <a
                  href={`tel:${company.phone}`}
                  dir="ltr"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {company.phone}
                </a>
              </p>
              <p>
                <span className="text-gray-400 dark:text-gray-500">{t('contact.info.email')}: </span>
                <a
                  href={`mailto:${company.email}`}
                  dir="ltr"
                  className="hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {company.email}
                </a>
              </p>
              <p>
                <span className="text-gray-400 dark:text-gray-500">{t('contact.info.address')}: </span>
                <span>{address}</span>
              </p>
            </div>
          </div>

          {/* Right: navigation */}
          <div>
            <p className="text-gray-900 dark:text-white font-semibold text-sm uppercase tracking-widest mb-4">
              {t('footer.links')}
            </p>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {NAV_LINKS.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar — copyright + utility controls */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
          <p>{t('footer.copyright')}</p>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
              <span className="text-xs">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            <span className="text-gray-300 dark:text-gray-700" aria-hidden="true">·</span>

            {/* Language toggle */}
            <button
              onClick={toggleLocale}
              aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              className="px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-medium"
            >
              {locale === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
