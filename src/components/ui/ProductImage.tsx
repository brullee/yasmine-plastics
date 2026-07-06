'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { ImageOffIcon } from './Icons'
import { cn } from '@/lib/utils'

interface Props extends ImageProps {
  unavailableLabel?: string
}

// Assumes `fill` + a relative/aspect-ratio parent (how every product/category
// photo on the site is used). If the image 404s, swap the browser's default
// broken-image icon + alt text for a plain branded placeholder instead.
export function ProductImage({ unavailableLabel, className, ...props }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={cn('absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 will-change-transform', className)}>
        <ImageOffIcon className="w-9 h-9" />
        {unavailableLabel && <span className="text-xs">{unavailableLabel}</span>}
      </div>
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text -- alt is required by ImageProps and passed via spread, not literal
    <Image {...props} className={cn(className, 'will-change-transform')} onError={() => setFailed(true)} />
  )
}
