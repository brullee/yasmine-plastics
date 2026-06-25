'use client'

import { ReactSelect, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string }

export function DefaultColorField() {
  const { value, setValue } = useField<number | null>({ path: 'defaultColor' })

  const colorIds = useFormFields(([fields]) => {
    const v = fields['colors']?.value
    return Array.isArray(v) ? (v as (number | string)[]).map(Number).filter(Boolean) : []
  })

  const [options, setOptions] = useState<Option[]>([])

  useEffect(() => {
    if (!colorIds.length) { setOptions([]); return }
    fetch('/api/colors?limit=200&depth=0&sort=nameEn')
      .then(r => r.json())
      .then(({ docs }) => {
        const ids = new Set(colorIds.map(String))
        setOptions(
          (docs as { id: number; nameEn: string }[])
            .filter(d => ids.has(String(d.id)))
            .map(d => ({ label: d.nameEn, value: String(d.id) }))
        )
      })
      .catch(() => {})
  }, [colorIds.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  if (!colorIds.length) return null

  const selected = value != null ? (options.find(o => o.value === String(value)) ?? undefined) : undefined

  return (
    <div className="field-type relationship">
      <label className="field-label">Default Color</label>
      <p className="field-description">The color pre-selected when a visitor lands on this product page. Defaults to the first color if unset.</p>
      <ReactSelect
        options={options}
        value={selected}
        isClearable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(next: any) => {
          setValue(next ? Number(next.value) : null)
        }}
        placeholder="Select default color..."
      />
    </div>
  )
}
