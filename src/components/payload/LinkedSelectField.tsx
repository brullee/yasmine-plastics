import { ReactSelect, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Option = { label: string; value: string }

interface Config {
  formField: string
  apiUrl: string
  docLabelKey: string
  displayLabel: string
  description?: string
  // The product page only renders a chip for this option when there's something to disambiguate:
  // colors always get a chip (even solo, plus the always-present Custom chip), sizes only get one
  // past 1 value (see ProductActions.tsx). So "disabled" and its placeholder differ per field.
  isDisabled: (itemCount: number) => boolean
  placeholderFor: (itemCount: number) => string
}

export function createLinkedField(config: Config) {
  const { formField, apiUrl, docLabelKey, displayLabel, description, isDisabled, placeholderFor } = config

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
    const disabled = isDisabled(itemIds.length)
    const placeholder = placeholderFor(itemIds.length)

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
