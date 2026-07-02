import { ReactSelect, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string }

interface Config {
  formField: string
  apiUrl: string
  docLabelKey: string
  displayLabel: string
  noItemsText: string
  oneItemText: string
  description?: string
}

export function createLinkedField(config: Config) {
  const { formField, apiUrl, docLabelKey, displayLabel, noItemsText, oneItemText, description } = config

  return function LinkedField({ path }: { path: string }) {
    const { value, setValue } = useField<number | null>({ path })

    const itemIds = useFormFields(([fields]) => {
      const v = fields[formField]?.value
      return Array.isArray(v) ? (v as (number | string)[]).map(Number).filter(Boolean) : []
    })

    const [options, setOptions] = useState<Option[]>([])

    useEffect(() => {
      if (!itemIds.length) { setOptions([]); return }
      fetch(apiUrl)
        .then(r => r.json())
        .then(({ docs }) => {
          const ids = new Set(itemIds.map(String))
          setOptions(
            (docs as Record<string, unknown>[])
              .filter(d => ids.has(String(d.id)))
              .map(d => ({ label: String(d[docLabelKey]), value: String(d.id) }))
          )
        })
        .catch(() => {})
    }, [itemIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

    const selected = value != null ? (options.find(o => o.value === String(value)) ?? undefined) : undefined
    const disabled = itemIds.length <= 1
    const placeholder = itemIds.length === 0 ? noItemsText : itemIds.length === 1 ? oneItemText : 'Select a value'

    return (
      <div className="field-type relationship" style={disabled ? { opacity: 0.35, pointerEvents: 'none' } : undefined}>
        <label className="field-label">{displayLabel}</label>
        <ReactSelect
          options={options}
          value={selected}
          isClearable
          disabled={disabled}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(next: any) => setValue(next ? Number(next.value) : null)}
          placeholder={placeholder}
        />
        {description && <p className="field-description">{description}</p>}
      </div>
    )
  }
}
