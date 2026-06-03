'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme()
  const lightHref = useRef<string | null>(null)

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (link) lightHref.current = link.getAttribute('href')
  }, [])

  useEffect(() => {
    if (!resolvedTheme) return

    const target = resolvedTheme === 'dark' ? '/icon-dark.svg' : (lightHref.current ?? '/icon.svg')

    const apply = () => {
      document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach(link => {
        if (!link.href.endsWith(target)) link.href = target
      })
    }

    apply()

    const observer = new MutationObserver(apply)
    observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] })

    return () => observer.disconnect()
  }, [resolvedTheme])

  return null
}
