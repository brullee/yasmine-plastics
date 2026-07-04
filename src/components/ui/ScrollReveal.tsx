'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up'
  delay?: number
  className?: string
}

const animName: Record<string, string> = {
  left:  'reveal-left',
  right: 'reveal-right',
  up:    'reveal-up',
}

export function ScrollReveal({ children, direction = 'up', delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reduced motion: skip the reveal/hide-on-scroll-out cycle entirely, not just its animation duration
    if (prefersReducedMotion()) return

    const play = () => {
      el.style.animation = 'none'
      void el.offsetHeight
      el.style.animation = `${animName[direction]} 0.7s ${delay}ms ease-out both`
    }

    el.style.opacity = '0'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.15 && !inView.current) {
          // Enough of the element is visible - animate in
          inView.current = true
          play()
        } else if (entry.intersectionRatio === 0 && inView.current) {
          // Fully off screen - silently reset so it re-animates next time
          inView.current = false
          el.style.animation = 'none'
          el.style.opacity = '0'
        }
      },
      { threshold: [0, 0.15] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [direction, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
