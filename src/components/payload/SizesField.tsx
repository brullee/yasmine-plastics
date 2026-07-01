'use client'

import { ReactSelect, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string; __isNew__?: boolean; [key: string]: unknown }

export function SizesField() {
  const { value, setValue } = useField<number[]>({ path: 'sizes' })
  const { value: unit, setValue: setUnit } = useField<number | null>({ path: 'sizeUnit' })
  const [options, setOptions]             = useState<Option[]>([])
  const [unitOptions, setUnitOptions]     = useState<Option[]>([])
  const [isLoading, setIsLoading]         = useState(false)
  const [isUnitLoading, setIsUnitLoading] = useState(false)

  useEffect(() => {
    fetch('/api/sizes?limit=500&depth=0&sort=label')
      .then(r => r.json())
      .then(({ docs }) =>
        setOptions(docs.map((d: { id: number; label: string }) => ({ label: d.label, value: String(d.id) })))
      )
      .catch(() => {})
    fetch('/api/units?limit=100&depth=0&sort=label')
      .then(r => r.json())
      .then(({ docs }) =>
        setUnitOptions(docs.map((d: { id: number; label: string }) => ({ label: d.label, value: String(d.id) })))
      )
      .catch(() => {})
  }, [])

  const selected = (value ?? [])
    .map(id => options.find(o => o.value === String(id)))
    .filter(Boolean) as Option[]

  const hasSizes = (value ?? []).length > 0
  const missingUnit = hasSizes && !unit
  const unitWithoutSizes = !hasSizes && !!unit

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
      if (ids.length === 0) setUnit(null)
      setIsLoading(false)
    })()
  }

  function handleUnitChange(next: Option | null) {
    if (!next) { setUnit(null); return }
    if (next.__isNew__) {
      void (async () => {
        setIsUnitLoading(true)
        try {
          const res = await fetch('/api/units', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ label: next.label }),
          })
          const { doc } = await res.json()
          const newOpt = { label: doc.label, value: String(doc.id) }
          setUnitOptions(prev => [...prev, newOpt].sort((a, b) => a.label.localeCompare(b.label)))
          setUnit(Number(doc.id))
        } catch {
          // skip failed creates silently
        }
        setIsUnitLoading(false)
      })()
    } else {
      setUnit(Number(next.value))
    }
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
            {...{
              isValidNewOption: (input: string, _val: unknown, opts: { label: string }[]) => {
                const trimmed = input.trim()
                return /^\d+(\.\d+)?$/.test(trimmed) && !opts.some(o => o.label === trimmed)
              }
            } as any}
          />
        </div>
        <div style={{ width: '160px', flexShrink: 0 }}>
          <ReactSelect
            isClearable
            isCreatable
            isLoading={isUnitLoading}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options={unitOptions as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={(unitOptions.find(u => u.value === String(unit)) ?? null) as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={handleUnitChange as any}
            placeholder="Unit"
            {...{
              isValidNewOption: (input: string, _val: unknown, opts: { label: string }[]) => {
                const trimmed = input.trim()
                return /^[a-zA-Z]+$/.test(trimmed) && !opts.some(o => o.label.toLowerCase() === trimmed.toLowerCase())
              }
            } as any}
          />
        </div>
      </div>
      <p className="field-description">Select from existing sizes and units, or type to create new ones.</p>
      {missingUnit && (
        <p style={{ color: 'var(--theme-error-500, #f87171)', fontSize: '12px', marginTop: '6px' }}>
          Unit of measurement is required when sizes are set
        </p>
      )}
      {unitWithoutSizes && (
        <p style={{ color: 'var(--theme-error-500, #f87171)', fontSize: '12px', marginTop: '6px' }}>
          A unit is selected but no sizes are added. Add at least one size or clear the unit.
        </p>
      )}
    </div>
  )
}
