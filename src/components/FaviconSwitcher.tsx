'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')
    links.forEach(link => {
      link.href = resolvedTheme === 'dark' ? '/icon-dark.svg' : '/icon.svg'
    })
  }, [resolvedTheme])

  return null
}
