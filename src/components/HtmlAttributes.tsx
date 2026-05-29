'use client'

import { useEffect } from 'react'

interface Props {
  locale: string
}

export function HtmlAttributes({ locale }: Props) {
  const isRtl = locale === 'ar'
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [locale, isRtl])
  return null
}
