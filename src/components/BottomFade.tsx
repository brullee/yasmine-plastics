'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function BottomFade() {
  const divRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
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
  }, [pathname])

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed bottom-0 left-0 right-0 h-24 sm:h-40 z-30 opacity-40 sm:opacity-100"
      style={{
        opacity: 1,
        background: `linear-gradient(to top,
              rgba(255, 255, 255, 0.88) 0%,
              rgba(255, 255, 255, 0.55) 18%,
              rgba(255, 255, 255, 0.22) 38%,
              rgba(255, 255, 255, 0.05) 55%,
              rgba(255, 255, 255, 0) 65%)`,
      }}
    />
  )
}
