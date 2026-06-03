'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function BottomFade() {
  const [mounted, setMounted] = useState(false)
  const [opacity, setOpacity] = useState(1)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const update = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight
      if (maxScroll <= 0) { setOpacity(0); return }
      setOpacity(Math.max(0, 1 - window.scrollY / maxScroll))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  if (!mounted) return null

  const color = resolvedTheme === 'dark' ? '13, 27, 42' : '220, 220, 220'

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 h-40 z-30"
      style={{
        opacity,
        background: resolvedTheme === 'dark'
          ? `linear-gradient(to top,
              rgba(${color}, 0.9) 0%,
              rgba(${color}, 0.65) 25%,
              rgba(${color}, 0.35) 55%,
              rgba(${color}, 0.1) 80%,
              rgba(${color}, 0) 100%)`
          : `linear-gradient(to top,
              rgba(${color}, 0.9) 0%,
              rgba(${color}, 0.65) 25%,
              rgba(${color}, 0.35) 55%,
              rgba(${color}, 0.1) 80%,
              rgba(${color}, 0) 100%)`,
      }}
    />
  )
}
