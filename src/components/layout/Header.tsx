'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { useTranslations, useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { Link, useRouter, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { button, chrome } from '@/lib/theme'
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from '@/components/ui/Icons'

type NavKey = 'home' | 'about' | 'products' | 'contact'
const NAV_LINKS: { key: NavKey; href: string; wip?: boolean }[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'products', href: '/products' },
  { key: 'contact', href: '/contact' },
]

const subtleBtn = cn('p-2 rounded-md', chrome.subtleBtn)

export function Header() {
  const t = useTranslations('nav')
  const tA11y = useTranslations('a11y')
  const [menuOpen, setMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = useState(false)
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const lastLocaleFixRef = useRef<string | null>(null)

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
      const target = `${pathname}${window.location.search}`
      const fixKey = `${target}->${saved}`
      // Guard against retrying a correction that didn't converge last time -
      // without this, a redirect that never settles can re-trigger this effect
      // synchronously and blow the call stack instead of just failing silently.
      if (lastLocaleFixRef.current === fixKey) {
        document.documentElement.style.opacity = ''
        return
      }
      lastLocaleFixRef.current = fixKey
      document.documentElement.style.opacity = '0'
      router.replace(target, { locale: saved as 'en' | 'ar' })
    } else {
      lastLocaleFixRef.current = null
      document.documentElement.style.opacity = ''
    }
  }, [pathname, locale])

  // Avoid hydration mismatch - system theme is unknown during SSR
  useEffect(() => setThemeMounted(true), [])

  return (
    <header className={cn('sticky top-0 z-50 bg-white dark:bg-brand-navyDeep border-b shadow-sm', chrome.divider)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/YasmineLogo.svg" alt="Yasmine Plastics" className="h-8 sm:h-10 w-auto dark:hidden" />
            <img src="/YasmineLogoDark.svg" alt="Yasmine Plastics" className="h-8 sm:h-10 w-auto hidden dark:block" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label={tA11y('mainNavigation')}>
            {NAV_LINKS.map(({ key, href, wip }) => (
              <Link
                key={key}
                href={href}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  wip
                    ? 'text-gray-500 dark:text-gray-400 pointer-events-none cursor-default'
                    : cn(chrome.navLink, 'hover:bg-gray-100 dark:hover:bg-brand-navyDark')
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
              <button onClick={toggleTheme} aria-label={tA11y('toggleTheme')} className={subtleBtn}>
                {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            )}

            {/* Language toggle */}
            <button onClick={toggleLocale} aria-label={tA11y('switchLanguage')} className={cn(subtleBtn, 'text-xs font-medium tracking-wide')}>
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>

            {/* CTA button */}
            <Link
              href="/quote"
              className={cn('hidden sm:inline-flex items-center ms-1 px-4 py-2 text-sm font-semibold rounded-md', button.primary)}
            >
              {t('quote')}
            </Link>

            {/* Mobile burger */}
            <button
              className={cn(subtleBtn, 'md:hidden')}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? tA11y('closeMenu') : tA11y('openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        inert={!menuOpen}
        className={cn(
          'md:hidden overflow-hidden transition-all duration-200',
          menuOpen ? 'max-h-80' : 'max-h-0'
        )}
      >
        <nav className={cn('px-4 pt-2 pb-4 border-t flex flex-col gap-1', chrome.divider)} aria-label={tA11y('mobileNavigation')}>
          {NAV_LINKS.map(({ key, href, wip }) => (
            <Link
              key={key}
              href={href}
              onClick={wip ? undefined : () => setMenuOpen(false)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                wip
                  ? 'text-gray-500 dark:text-gray-400 pointer-events-none cursor-default'
                  : cn(chrome.navLink, 'hover:bg-gray-100 dark:hover:bg-brand-navyDark')
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
            className={cn('mt-2 block text-center px-4 py-2 text-sm font-semibold rounded-md', button.primary)}
          >
            {t('quote')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
