'use client'

import { useState } from 'react'
import { ProductCard } from './ProductCard'
import { QuickViewModal } from './QuickViewModal'
import type { Product, Locale } from '@/types'

interface Props {
  products: Product[]
  locale: Locale
}

export function ProductsGrid({ products, locale }: Props) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            locale={locale}
            onQuickView={setQuickViewProduct}
          />
        ))}
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          locale={locale}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  )
}
