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
      const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (maxScroll < 200) { setOpacity(0); return }
      const progress = window.scrollY / maxScroll
      const eased = Math.pow(1 - Math.min(progress, 1), 0.4)
      setOpacity(eased)
    }

    requestAnimationFrame(() => requestAnimationFrame(update))
    setTimeout(update, 300)
    setTimeout(update, 1000)

    const ro = new ResizeObserver(update)
    ro.observe(document.body)

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  if (!mounted) return null

  const color = resolvedTheme === 'dark' ? '13, 27, 42' : '220, 220, 220'

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 h-40 z-30"
      style={{
        opacity,
        transition: 'opacity 300ms ease-out',
        background: `linear-gradient(to top,
            rgba(${color}, 0.9) 0%,
            rgba(${color}, 0.6) 18%,
            rgba(${color}, 0.25) 38%,
            rgba(${color}, 0.05) 55%,
            rgba(${color}, 0) 65%)`,
      }}
    />
  )
}
