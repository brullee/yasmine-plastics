'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ProductActions } from '@/components/ui/ProductActions'
import { cn } from '@/lib/utils'
import type { Product, Locale } from '@/types'

function formatDimensions(product: Product): string | undefined {
  if (product.shapeType === 'circular' && product.diameterTop && product.height) {
    const phi = product.diameterBottom
      ? `φ${product.diameterTop}/${product.diameterBottom}`
      : `φ${product.diameterTop}`
    return `${phi} × H${product.height} mm`
  }
  if (product.shapeType === 'rectangular' && product.width && product.length && product.height)
    return `W${product.width} × L${product.length} × H${product.height} mm`
  return undefined
}

interface Props {
  product: Product
  name: string
  categoryName: string
  compatibleLids: Product[]
  fitsContainers: Product[]
  whatsappNumber: string
  locale: Locale
}

export function ProductMainSection({
  product, name, categoryName, compatibleLids, fitsContainers, whatsappNumber, locale,
}: Props) {
  const t = useTranslations('product')

  const ownImages = [product.image, ...(product.gallery ?? [])]
  const pairingSlides = fitsContainers
    .map((c) => ({ slug: c.slug, url: c.pairingImages?.[product.slug] ?? '' }))
    .filter((e) => e.url && !ownImages.includes(e.url))
  const images = [...ownImages, ...pairingSlides.map((e) => e.url)]

  const firstPartnerSlug = compatibleLids[0]?.slug ?? fitsContainers[0]?.slug ?? null

  const [selectedPartner, setSelectedPartner] = useState<string | null>(firstPartnerSlug)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const displayImage = images[carouselIndex]

  function handlePartnerChange(slug: string | null) {
    setSelectedPartner(slug)
    if (!slug) return
    // Container page: pairing image is in our own gallery
    const ownPairingUrl = product.pairingImages?.[slug]
    if (ownPairingUrl) {
      const idx = images.indexOf(ownPairingUrl)
      if (idx !== -1) { setCarouselIndex(idx); return }
    }
    // Lid page: jump to the appended pairing slide
    const slide = pairingSlides.find((e) => e.slug === slug)
    if (slide) {
      const idx = images.indexOf(slide.url)
      if (idx !== -1) setCarouselIndex(idx)
    }
  }

  function prev() {
    setCarouselIndex((i) => (i - 1 + images.length) % images.length)
  }

  function next() {
    setCarouselIndex((i) => (i + 1) % images.length)
  }

  const showCarouselControls = images.length > 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">

      {/* ── Left: Image carousel ── */}
      <div className="space-y-3">
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800 shadow-md">
          <Image
            src={displayImage}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-opacity duration-200"
            priority
          />

          {showCarouselControls && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute start-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow transition-colors"
              >
                <ChevronIcon direction={locale === 'ar' ? 'right' : 'left'} />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute end-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 shadow transition-colors"
              >
                <ChevronIcon direction={locale === 'ar' ? 'left' : 'right'} />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators */}
        {showCarouselControls && (
          <div className="flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                aria-label={`Image ${i + 1}`}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === carouselIndex
                    ? 'bg-brand-navy dark:bg-sky-400'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500',
                )}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip (own gallery) */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                  i === carouselIndex
                    ? 'border-brand-navy dark:border-sky-400'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                )}
              >
                <Image src={src} alt={`${name} ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Right: Info ── */}
      <div className="space-y-6">

        {/* Name */}
        <div>
          {product.artCode && (
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 font-mono">
              ART-{product.artCode}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy dark:text-white leading-tight">
            {name}
          </h1>
        </div>

        {/* Category pill */}
        <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5">
          <span className="text-gray-500 dark:text-gray-400 text-sm">{t('category')}:</span>
          <span className="text-gray-900 dark:text-white font-semibold text-sm">{categoryName}</span>
        </div>

        <ProductActions
          colors={product.options.colors}
          sizes={product.options.sizes}
          lids={compatibleLids}
          fitsContainers={fitsContainers}
          selectedPartner={selectedPartner}
          onPartnerChange={handlePartnerChange}
          productName={name}
          productSlug={product.slug}
          whatsappNumber={whatsappNumber}
          locale={locale}
        />

        {/* Specifications */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            {t('keyAttributes')}
          </h2>
          <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {[
              { label: t('material'), value: product.material },
              { label: t('capacity'), value: product.capacity },
              { label: t('piecesPerBox'), value: product.piecesPerBox?.toString() },
              { label: t('dimensions'), value: formatDimensions(product) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-800 px-4 py-3">
                <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}
