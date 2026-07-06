'use client'

import { useEffect, useRef } from 'react'
import { company } from '@/data/company'
import { buildWhatsAppUrl } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/ui/Icons'

const labels: Record<string, string> = {
  en: 'Contact via WhatsApp',
  ar: 'تواصل عبر واتساب',
}

const BASE = 16 // px from bottom at rest

export function WhatsAppFAB({ locale }: { locale: string }) {
  const label = labels[locale] ?? labels.en
  const url = buildWhatsAppUrl(company.whatsapp)
  const fabRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const fab = fabRef.current
    const footerBarEl = document.getElementById('footer-bottom-bar')
    if (!fab || !footerBarEl) return
    const el = fab
    const footerBar = footerBarEl

    let isRaised = false

    function update() {
      const shouldRaise = window.innerWidth < 1780 && footerBar.getBoundingClientRect().top < window.innerHeight

      if (shouldRaise === isRaised) return
      isRaised = shouldRaise

      el.style.transition = 'bottom 0.25s ease'
      if (shouldRaise) {
        const barHeight = footerBar.getBoundingClientRect().height
        // On mobile the FAB is icon-only so needs less clearance above the bar
        const gap = window.innerWidth < 640 ? 6 : BASE
        el.style.bottom = `${barHeight + gap}px`
      } else {
        el.style.bottom = ''
      }
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <a
      ref={fabRef}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-4 right-6 rtl:right-auto rtl:left-6 z-50 flex items-center gap-2.5 bg-brand-navy text-white p-3 sm:px-5 sm:py-3 rounded-full shadow-lg hover:bg-brand-navyHover dark:bg-brand-navyDark dark:hover:bg-brand-navy transition-colors"
    >
      <span className="hidden sm:inline text-sm font-semibold">{label}</span>
      <WhatsAppIcon size={20} />
    </a>
  )
}
