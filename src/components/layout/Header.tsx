'use client'

import { useState, useEffect, useLayoutEffect } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { useTranslations, useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { Link, useRouter, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type NavKey = 'home' | 'about' | 'products' | 'contact'
const NAV_LINKS: { key: NavKey; href: string; wip?: boolean }[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'products', href: '/products' },
  { key: 'contact', href: '/contact' },
]

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

const subtleBtn = 'p-2 rounded-md text-gray-400 hover:text-brand-navy dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-brand-navyDark transition-colors'

export function Header() {
  const t = useTranslations('nav')
  const [menuOpen, setMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar'
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    router.replace(`${pathname}${window.location.search}`, { locale: newLocale })
  }

  // When back/forward navigation lands on a URL whose locale doesn't match the
  // saved preference (e.g. back-button to an old /en/ URL after switching to Arabic),
  // silently redirect to the correct locale. Runs on every pathname change so it
  // catches client-side back/forward navigations that bypass the middleware.
  useIsomorphicLayoutEffect(() => {
    const saved = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1]
    if (saved && (saved === 'en' || saved === 'ar') && saved !== locale) {
      document.documentElement.style.opacity = '0'
      router.replace(`${pathname}${window.location.search}`, { locale: saved as 'en' | 'ar' })
    } else {
      document.documentElement.style.opacity = ''
    }
  }, [pathname, locale])

  // Avoid hydration mismatch - system theme is unknown during SSR
  useEffect(() => setThemeMounted(true), [])

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-brand-navyDeep border-b border-gray-200 dark:border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/YasmineLogo.svg" alt="Yasmine Plastics" className="h-8 sm:h-10 w-auto dark:hidden" />
            <img src="/YasmineLogoDark.svg" alt="Yasmine Plastics" className="h-8 sm:h-10 w-auto hidden dark:block" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ key, href, wip }) => (
              <Link
                key={key}
                href={href}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  wip
                    ? 'text-gray-500 dark:text-gray-400 pointer-events-none cursor-default'
                    : 'text-gray-700 dark:text-gray-300 hover:text-brand-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-navyDark'
                )}
              >
                {t(key)}
                {wip && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                    {t('comingSoon')}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right-side controls */}
          <div className="flex items-center gap-1">
            {/* Theme toggle - rendered only after mount to avoid SSR/client mismatch */}
            {themeMounted && (
              <button onClick={toggleTheme} aria-label="Toggle theme" className={subtleBtn}>
                {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            )}

            {/* Language toggle */}
            <button onClick={toggleLocale} aria-label="Switch language" className={cn(subtleBtn, 'text-xs font-medium tracking-wide')}>
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>

            {/* CTA button */}
            <Link
              href="/quote"
              className="hidden sm:inline-flex items-center ms-1 px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-md hover:bg-brand-navyDark dark:bg-brand-navyDark dark:hover:bg-brand-navy transition-colors"
            >
              {t('quote')}
            </Link>

            {/* Mobile burger */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-brand-navyDark transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-200',
          menuOpen ? 'max-h-80' : 'max-h-0'
        )}
      >
        <nav className="px-4 pt-2 pb-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ key, href, wip }) => (
            <Link
              key={key}
              href={href}
              onClick={wip ? undefined : () => setMenuOpen(false)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                wip
                  ? 'text-gray-500 dark:text-gray-500 pointer-events-none cursor-default'
                  : 'text-gray-700 dark:text-gray-300 hover:text-brand-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-navyDark'
              )}
            >
              {t(key)}
              {wip && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                  {t('comingSoon')}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/quote"
            onClick={() => setMenuOpen(false)}
            className="mt-2 block text-center px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-md hover:bg-brand-navyDark transition-colors"
          >
            {t('quote')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
