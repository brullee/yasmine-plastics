'use client'

import { useState, useEffect } from 'react'
import Image, { type ImageProps } from 'next/image'
import { ImageOffIcon } from './Icons'
import { cn } from '@/lib/utils'

interface Props extends ImageProps {
  unavailableLabel?: string
  size?: 'xs' | 'sm' | 'lg'
  onFail?: () => void
}

const ICON_SIZE = { xs: 'w-4 h-4', sm: 'w-11 h-11', lg: 'w-16 h-16' }
const GAP_SIZE  = { xs: 'gap-0', sm: 'gap-2', lg: 'gap-3' }

// Assumes `fill` + a relative/aspect-ratio parent (how every product/category
// photo on the site is used). If the image 404s, swap the browser's default
// broken-image icon + alt text for a plain branded placeholder instead.
// `size="lg"` is for large single-image contexts (product page hero, lightbox);
// `sm` (default) suits cards and thumbnails; `xs` is for icon-sized thumbs
// (e.g. the paired-product picker) too small to fit even the `sm` icon.
// `onFail` lets a parent that renders several of these (a gallery/carousel)
// track which specific images are down, e.g. to disable zoom/lightbox controls.
export function ProductImage({ unavailableLabel, className, size = 'sm', onFail, ...props }: Props) {
  const [failed, setFailed] = useState(false)

  useEffect(() => { if (failed) onFail?.() }, [failed, onFail])

  if (failed) {
    return (
      <div className={cn('absolute inset-0 flex flex-col items-center justify-center text-gray-400 will-change-transform', GAP_SIZE[size], className)}>
        <ImageOffIcon className={ICON_SIZE[size]} />
        {unavailableLabel && <span className={size === 'lg' ? 'text-sm' : 'text-xs'}>{unavailableLabel}</span>}
      </div>
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps and passed via spread, not literal
    <Image {...props} className={cn(className, 'will-change-transform')} onError={() => setFailed(true)} />
  )
}
