'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'

export function BottomFade() {
  const [mounted, setMounted] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return

    const update = () => {
      const el = divRef.current
      if (!el) return
      const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (maxScroll < 200) { el.style.opacity = '0'; return }
      const progress = window.scrollY / maxScroll
      el.style.opacity = String(Math.pow(1 - Math.min(progress, 1), 0.4))
    }

    // Snap to correct opacity instantly on navigation, then re-enable transition
    const el = divRef.current
    if (el) {
      el.style.transition = 'none'
      requestAnimationFrame(() => {
        update()
        requestAnimationFrame(() => {
          if (divRef.current) divRef.current.style.transition = 'opacity 300ms ease-out'
        })
      })
    }

    const ro = new ResizeObserver(update)
    ro.observe(document.body)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [mounted, pathname])

  if (!mounted) return null

  const color = resolvedTheme === 'dark' ? '13, 27, 42' : '255, 255, 255'

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed bottom-0 left-0 right-0 h-24 sm:h-40 z-30 opacity-40 sm:opacity-100"
      style={{
        opacity: 1,
        background: resolvedTheme === 'dark'
          ? `linear-gradient(to top,
              rgba(${color}, 0.95) 0%,
              rgba(${color}, 0.7) 18%,
              rgba(${color}, 0.3) 38%,
              rgba(${color}, 0.07) 55%,
              rgba(${color}, 0) 65%)`
          : `linear-gradient(to top,
              rgba(${color}, 0.88) 0%,
              rgba(${color}, 0.55) 18%,
              rgba(${color}, 0.22) 38%,
              rgba(${color}, 0.05) 55%,
              rgba(${color}, 0) 65%)`,
      }}
    />
  )
}
