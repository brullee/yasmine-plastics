'use client'

import { ReactSelect, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string }

export function LinkedSizesField({ path }: { path: string }) {
  const { value, setValue } = useField<number | null>({ path })

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

  const selected = value != null ? (options.find(o => o.value === String(value)) ?? undefined) : undefined
  const disabled = sizeIds.length <= 1
  const placeholder = sizeIds.length === 0 ? 'No sizes on this product' : sizeIds.length === 1 ? 'Only one size' : 'Select a value'

  return (
    <div className="field-type relationship" style={disabled ? { opacity: 0.35, pointerEvents: 'none' } : undefined}>
      <label className="field-label">Size shown</label>
      <ReactSelect
        options={options}
        value={selected}
        isClearable
        disabled={disabled}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(next: any) => setValue(next ? Number(next.value) : null)}
        placeholder={placeholder}
      />
    </div>
  )
}
