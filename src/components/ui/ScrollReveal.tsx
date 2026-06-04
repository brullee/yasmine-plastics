'use client'

import { useEffect, useRef } from 'react'

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

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const play = () => {
      el.style.animation = 'none'
      void el.offsetHeight // flush so the browser resets the animation
      el.style.animation = `${animName[direction]} 0.7s ${delay}ms ease-out both`
    }

    el.style.opacity = '0'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play()
        } else {
          el.style.animation = 'none'
          el.style.opacity = '0'
        }
      },
      { threshold: 0.15 }
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
