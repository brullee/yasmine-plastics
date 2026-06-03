'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return

    const target = resolvedTheme === 'dark' ? '/icon-dark.svg' : '/icon.svg'

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
