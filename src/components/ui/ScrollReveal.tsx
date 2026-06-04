'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up'
  delay?: number
  className?: string
}

export function ScrollReveal({ children, direction = 'up', delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const transforms: Record<string, string> = {
    left:  'opacity-0 -translate-x-10',
    right: 'opacity-0 translate-x-10',
    up:    'opacity-0 translate-y-8',
  }

  return (
    <div
      ref={ref}
      className={`transition-all ease-out duration-700 ${visible ? 'opacity-100 translate-x-0 translate-y-0' : transforms[direction]} ${className ?? ''}`}
      style={{ transitionDelay: `${delay}ms`, willChange: 'transform, opacity' }}
    >
      {children}
    </div>
  )
}
