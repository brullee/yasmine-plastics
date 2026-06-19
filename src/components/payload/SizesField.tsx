'use client'

import { ReactSelect, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string; __isNew__?: boolean; [key: string]: unknown }

export function SizesField() {
  const { value, setValue } = useField<number[]>({ path: 'sizes' })
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
      <ReactSelect
        isMulti
        isCreatable
        isLoading={isLoading}
        options={options}
        value={selected}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={handleChange as any}
        placeholder="Select or type to add..."
      />
    </div>
  )
}
