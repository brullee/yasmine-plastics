'use client'

import { ReactSelect, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type ProductDoc = {
  id: number
  nameEn: string
  internalName?: string
  artCode?: string
}

type Option = { label: string; value: string }

// Same lid categories as these fields' `filterOptions` in payload.config.ts.
const LID_CATEGORY_SLUGS = ['lids', 'lid', 'papercup-lids', 'papercup-lid']

// The default relationship picker shows `nameEn` (the products collection's global
// useAsTitle) — several lids can share a near-identical customer-facing name, making
// it easy to pair the wrong SKU. Lead with the internal/factory name and art code
// instead, which is what actually disambiguates them for whoever's picking here.
function formatLabel(doc: ProductDoc): string {
  const primary = doc.internalName?.trim() || doc.nameEn
  return doc.artCode ? `${primary} · art ${doc.artCode}` : primary
}

function useLidOptions() {
  const [options, setOptions] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const where = LID_CATEGORY_SLUGS
      .map((slug, i) => `where[or][${i}][category.slug][equals]=${encodeURIComponent(slug)}`)
      .join('&')
    fetch(`/api/products?limit=500&depth=0&${where}`)
      .then(r => r.json())
      .then(({ docs }) => {
        setOptions(
          (docs as ProductDoc[])
            .map(d => ({ label: formatLabel(d), value: String(d.id) }))
            .sort((a, b) => a.label.localeCompare(b.label))
        )
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return { options, isLoading }
}

// Gallery-row field: pairs one lid to a specific combined product photo.
export function PairedLidField({ path }: { path: string }) {
  const { value, setValue } = useField<number | null>({ path })
  const { options, isLoading } = useLidOptions()

  const selected = value != null ? (options.find(o => o.value === String(value)) ?? undefined) : undefined

  return (
    <div className="field-type relationship">
      <label className="field-label">Paired with lid</label>
      <ReactSelect
        options={options}
        value={selected}
        isLoading={isLoading}
        isClearable
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(next: any) => setValue(next ? Number(next.value) : null)}
        placeholder="Select a lid"
      />
      <p className="field-description">Shown as internal name + art code so similarly-named lids aren&apos;t mixed up.</p>
    </div>
  )
}

// Options-tab field: declares compatibility directly, same shape as Colors/Sizes,
// with no dependency on a paired gallery photo existing.
export function CompatibleLidsField({ path }: { path: string }) {
  const { value, setValue } = useField<number[]>({ path })
  const { options, isLoading } = useLidOptions()

  const selected = (value ?? [])
    .map(id => options.find(o => o.value === String(id)))
    .filter(Boolean) as Option[]

  return (
    <div className="field-type relationship">
      <label className="field-label">Compatible Lids</label>
      <ReactSelect
        isMulti
        options={options}
        value={selected}
        isLoading={isLoading}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(next: any) => setValue((Array.isArray(next) ? next : []).map((o: Option) => Number(o.value)))}
        placeholder="Select compatible lids"
      />
      <p className="field-description">Shown as internal name + art code so similarly-named lids aren&apos;t mixed up.</p>
    </div>
  )
}
