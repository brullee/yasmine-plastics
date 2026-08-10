'use client'

import { useCallback, useState } from 'react'
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

  // Stable across re-renders so ProductCard's React.memo isn't defeated by a
  // fresh closure every time `qv` changes — otherwise opening/closing the
  // quick view modal re-renders every card in the grid, not just the modal.
  const handleQuickView = useCallback((product: Product, originRect: DOMRect) => {
    setQv({ product, originRect })
  }, [])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.slug}
            product={product}
            locale={locale}
            onQuickView={handleQuickView}
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
