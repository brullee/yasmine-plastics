'use client'

import { useEffect, useState } from 'react'
import { company } from '@/data/company'

export function MapEmbed() {
  const [zoom, setZoom] = useState(14)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = (e: MediaQueryList | MediaQueryListEvent) => setZoom(e.matches ? 15 : 14)
    update(mq)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const src = company.mapEmbedUrl.replace(/z=\d+/, `z=${zoom}`)

  return (
    <section className="h-64 sm:h-80 md:h-96 lg:h-[450px] w-full">
      <iframe
        key={zoom}
        title="Yasmine Plastics location"
        src={src}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full block"
      />
    </section>
  )
}
