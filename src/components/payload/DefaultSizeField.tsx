'use client'

import { ReactSelect, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string }

export function DefaultSizeField() {
  const { value, setValue } = useField<number | null>({ path: 'defaultSize' })

  const sizeIds = useFormFields(([fields]) => {
    const v = fields['sizes']?.value
    return Array.isArray(v) ? (v as (number | string)[]).map(Number).filter(Boolean) : []
  })

  const [options, setOptions] = useState<Option[]>([])

  useEffect(() => {
    if (!sizeIds.length) { setOptions([]); return }
    fetch('/api/sizes?limit=200&depth=0&sort=label')
      .then(r => r.json())
      .then(({ docs }) => {
        const ids = new Set(sizeIds.map(String))
        setOptions(
          (docs as { id: number; label: string }[])
            .filter(d => ids.has(String(d.id)))
            .map(d => ({ label: d.label, value: String(d.id) }))
        )
      })
      .catch(() => {})
  }, [sizeIds.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  if (!sizeIds.length) return null

  const selected = value != null ? (options.find(o => o.value === String(value)) ?? undefined) : undefined

  return (
    <div className="field-type relationship">
      <label className="field-label">Default Size</label>
      <p className="field-description">The size pre-selected when a visitor lands on this product page. Defaults to the first size if unset.</p>
      <ReactSelect
        options={options}
        value={selected}
        isClearable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(next: any) => {
          setValue(next ? Number(next.value) : null)
        }}
        placeholder="Select default size..."
      />
    </div>
  )
}
