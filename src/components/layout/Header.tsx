'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type NavKey = 'home' | 'about' | 'products' | 'contact'
const NAV_LINKS: { key: NavKey; href: string; wip?: boolean }[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'products', href: '/products', wip: true },
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

export function Header() {
  const t = useTranslations('nav')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-brand-navyDeep border-b border-gray-200 dark:border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/Yasmine Logo 2.svg" alt="Yasmine Plastics" className="h-10 w-auto dark:hidden" />
            <img src="/Yasmine Logo 2 Dark.svg" alt="Yasmine Plastics" className="h-10 w-auto hidden dark:block" />
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
          <div className="flex items-center gap-2">
            {/* CTA button */}
            <Link
              href="/quote"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-md hover:bg-brand-navyDark dark:bg-brand-navyDark dark:hover:bg-brand-navy transition-colors"
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
