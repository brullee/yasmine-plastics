'use client'

import { useState } from 'react'
import { ProductCard } from './ProductCard'
import { QuickViewModal } from './QuickViewModal'
import type { Product, Locale } from '@/types'

interface Props {
  products: Product[]
  allProducts?: Product[]
  locale: Locale
}

interface QVState {
  product: Product
  originRect: DOMRect
}

export function ProductsGrid({ products, allProducts, locale }: Props) {
  const [qv, setQv] = useState<QVState | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.slug}
            product={product}
            locale={locale}
            onQuickView={(p, rect) => setQv({ product: p, originRect: rect })}
            priority={i < 4}
          />
        ))}
      </div>

      {qv && (
        <QuickViewModal
          product={qv.product}
          originRect={qv.originRect}
          locale={locale}
          allProducts={allProducts}
          onClose={() => setQv(null)}
        />
      )}
    </>
  )
}
