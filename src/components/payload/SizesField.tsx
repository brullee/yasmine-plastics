'use client'

import { ReactSelect, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string; __isNew__?: boolean; [key: string]: unknown }

const UNITS = [
  { label: 'ml', value: 'ml' },
  { label: 'L', value: 'L' },
  { label: 'g', value: 'g' },
  { label: 'oz', value: 'oz' },
]

export function SizesField() {
  const { value, setValue } = useField<number[]>({ path: 'sizes' })
  const { value: unit, setValue: setUnit } = useField<string>({ path: 'sizeUnit' })
  const [options, setOptions]     = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/sizes?limit=500&depth=0&sort=label')
      .then(r => r.json())
      .then(({ docs }) =>
        setOptions(docs.map((d: { id: number; label: string }) => ({ label: d.label, value: String(d.id) })))
      )
      .catch(() => {})
  }, [])

  const selected = (value ?? [])
    .map(id => options.find(o => o.value === String(id)))
    .filter(Boolean) as Option[]

  const hasSizes = (value ?? []).length > 0
  const missingUnit = hasSizes && !unit

  function handleChange(next: Option | Option[]) {
    void (async () => {
    const items = Array.isArray(next) ? next : [next]
    setIsLoading(true)
    const ids: number[] = []

    for (const item of items) {
      if (item.__isNew__) {
        try {
          const res = await fetch('/api/sizes', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ label: item.label }),
          })
          const { doc } = await res.json()
          const newOpt  = { label: doc.label, value: String(doc.id) }
          setOptions(prev => [...prev, newOpt].sort((a, b) => a.label.localeCompare(b.label)))
          ids.push(Number(doc.id))
        } catch {
          // skip failed creates silently
        }
      } else {
        ids.push(Number(item.value))
      }
    }

      setValue(ids)
      setIsLoading(false)
    })()
  }

  return (
    <div className="field-type relationship">
      <label className="field-label">Sizes</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <ReactSelect
            isMulti
            isCreatable
            isLoading={isLoading}
            options={options}
            value={selected}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={handleChange as any}
            placeholder="Add a size"
          />
        </div>
        <div style={{ width: '160px', flexShrink: 0 }}>
          <ReactSelect
            isClearable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options={UNITS as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={(UNITS.find(u => u.value === unit) ?? null) as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(opt: any) => setUnit(opt?.value ?? null)}
            placeholder="Unit"
          />
        </div>
      </div>
      {missingUnit && (
        <p style={{ color: 'var(--theme-error-500, #f87171)', fontSize: '12px', marginTop: '6px' }}>
          Unit of measurement is required when sizes are set
        </p>
      )}
    </div>
  )
}
