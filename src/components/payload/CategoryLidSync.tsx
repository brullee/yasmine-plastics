'use client'

import { useField } from '@payloadcms/ui'
import { useEffect } from 'react'

export function CategoryLidSync() {
  const { value: categoryId } = useField<number | string | null>({ path: 'category' })
  const { setValue } = useField<boolean>({ path: 'hasCompatibleLids' })

  useEffect(() => {
    if (!categoryId) {
      setValue(false)
      return
    }
    fetch(`/api/categories/${categoryId}?depth=0`)
      .then((r) => r.json())
      .then((cat) => setValue(!!cat.supportsCompatibleLids))
      .catch(() => setValue(false))
  }, [categoryId])

  return null
}
