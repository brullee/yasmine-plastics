'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import { company } from '@/data/company'
import { SunIcon, MoonIcon } from '@/components/ui/Icons'

type FooterNavKey = 'home' | 'about' | 'products' | 'contact' | 'quote'
const NAV_LINKS: { key: FooterNavKey; href: string; wip?: boolean }[] = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'products', href: '/products' },
  { key: 'contact', href: '/contact' },
  { key: 'quote', href: '/quote' },
]

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
    const newLocale = locale === 'en' ? 'ar' : 'en'
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    router.replace(`${pathname}${window.location.search}`, { locale: newLocale })
  }

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <footer className="bg-white dark:bg-brand-navyDeep border-t border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: contact info */}
          <div className="space-y-4">
            <p className="text-brand-navy dark:text-white font-semibold text-sm uppercase tracking-widest mb-4">{t('footer.ourInfo')}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-1">
                <span className="text-gray-500 dark:text-gray-400 shrink-0">{t('contact.info.phone')}: </span>
                <div className="flex flex-col gap-1">
                  <a href={`tel:${company.phone}`} dir="ltr" className="dark:text-gray-300 hover:text-brand-navy dark:hover:text-white transition-colors">{company.phone}</a>
                  <a href={`tel:${company.phone2}`} dir="ltr" className="dark:text-gray-300 hover:text-brand-navy dark:hover:text-white transition-colors">{company.phone2}</a>
                </div>
              </div>
              <p>
                <span className="text-gray-500 dark:text-gray-400">{t('contact.info.email')}: </span>
                <a href={`mailto:${company.email}`} dir="ltr" className="dark:text-gray-300 hover:text-brand-navy dark:hover:text-white transition-colors">{company.email}</a>
              </p>
              <div className="max-w-[22rem]">
                <span className="text-gray-500 dark:text-gray-400">{t('contact.info.address')}: </span>
                <a href={company.mapShareUrl} target="_blank" rel="noopener noreferrer" className="dark:text-gray-300 hover:text-brand-navy dark:hover:text-white transition-colors">{address}</a>
              </div>
            </div>
          </div>

          {/* Right: navigation */}
          <div>
            <p className="text-brand-navy dark:text-white font-semibold text-sm uppercase tracking-widest mb-4">
              {t('footer.links')}
            </p>
            <nav className="flex flex-col gap-2" aria-label="Footer navigation">
              {NAV_LINKS.map(({ key, href, wip }) => (
                <Link
                  key={key}
                  href={href}
                  className={`inline-flex items-center gap-1.5 text-sm transition-colors w-fit ${
                    wip
                      ? 'text-gray-500 dark:text-gray-400 pointer-events-none cursor-default'
                      : 'text-gray-500 dark:text-gray-400 hover:text-brand-navy dark:hover:text-white'
                  }`}
                >
                  {t(`nav.${key}`)}
                  {wip && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">
                      {t('nav.comingSoon')}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom bar - copyright + utility controls */}
      <div id="footer-bottom-bar" className="border-t border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
          <p>{t('footer.copyright')}</p>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-brand-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-navyDark transition-colors"
            >
              {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
              <span className="text-xs font-arabic font-medium">{isDark ? t('footer.light') : t('footer.dark')}</span>
            </button>

            <span className="text-sm font-sans text-gray-300 dark:text-gray-600 select-none" aria-hidden="true">•</span>

            {/* Language toggle */}
            <button
              onClick={toggleLocale}
              aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              className="px-3 py-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:text-brand-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-navyDark transition-colors text-xs font-medium font-arabic"
            >
              {locale === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
