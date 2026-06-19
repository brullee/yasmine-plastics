'use client'

import { useField } from '@payloadcms/ui'
import { useEffect } from 'react'

const SLUG_TO_MATERIAL: Record<string, string> = {
  cups:             'PP',
  containers:       'PP',
  buckets:          'PS',
  lids:             'PP',
  'papercup-lids':  'PS',
  'paper-cup-lids': 'PS',
}

async function resolveMaterialId(name: string): Promise<string | number | null> {
  try {
    const res = await fetch(`/api/materials?where[name][equals]=${encodeURIComponent(name)}&limit=1&depth=0`)
    const { docs } = await res.json()
    return docs?.[0]?.id ?? null
  } catch {
    return null
  }
}

export function CategoryMaterialSync() {
  const { value: categoryId } = useField<number | string | null>({ path: 'category' })
  const { value: material, setValue: setMaterial } = useField<number | string | null>({ path: 'material' })

  useEffect(() => {
    if (!categoryId || material) return

    fetch(`/api/categories/${categoryId}?depth=1`)
      .then(r => r.json())
      .then(async (cat) => {
        // 1. Category has a defaultMaterial set — use it directly
        const directId = typeof cat.defaultMaterial === 'object'
          ? cat.defaultMaterial?.id
          : cat.defaultMaterial
        if (directId) { setMaterial(directId); return }

        // 2. Slug map fallback
        const materialName = SLUG_TO_MATERIAL[cat.slug] ?? 'PP'
        const id = await resolveMaterialId(materialName)
        if (id) { setMaterial(id); return }

        // 3. Last resort — any material named PP
        const fallbackId = await resolveMaterialId('PP')
        if (fallbackId) setMaterial(fallbackId)
      })
      .catch(() => {})
  }, [categoryId])

  return null
}
