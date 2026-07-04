'use client'

import { ReactSelect, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string }

export function MainImageColorsField() {
  const { value, setValue } = useField<number | null>({ path: 'mainImageLinkedColors' })

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

  const selected = value != null ? (options.find(o => o.value === String(value)) ?? undefined) : undefined
  const disabled = colorIds.length === 0
  const placeholder = colorIds.length === 0 ? 'No colors on this product' : 'Select a value'

  return (
    <div className="field-type relationship" style={disabled ? { opacity: 0.35, pointerEvents: 'none' } : undefined}>
      <label className="field-label">Color shown</label>
      <ReactSelect
        options={options}
        value={selected}
        isClearable
        disabled={disabled}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(next: any) => setValue(next ? Number(next.value) : null)}
        placeholder={placeholder}
      />
      <p className="field-description">Selecting these color/size options on the product page jumps to this image.</p>
    </div>
  )
}
