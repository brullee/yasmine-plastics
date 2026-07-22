'use client'

import { useField } from '@payloadcms/ui'
import type { RadioFieldClientComponent } from 'payload'

// Deliberately not delegating to Payload's own <RadioGroupField>. That component calls
// useField() internally on its own path and uses ITS OWN `disabled` (formProcessing ||
// formInitializing, form-wide flags) to add a `--disabled` class straight onto each
// radio input and its own label — completely independent of anything this wrapper does.
// Confirmed live: with normalizeImage reading true (so this file's own dimming is
// inactive), the radio inputs + their own option labels still greyed out while the
// field's title/description (not touched by that internal class) stayed full color -
// proof the grey was coming from Payload's own component, not this file. Rendering the
// three options directly here sidesteps that entirely; we only use useField for
// value/setValue, never touching its disabled/readOnly output.
const OPTIONS: { label: string; value: string }[] = [
  { label: 'Standard (65%)', value: 'standard' },
  { label: 'Spacious (55%)', value: 'gentle' },
  { label: 'Wide (35%)', value: 'wide' },
]

export const ProcessingModeField: RadioFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  // processingMode only matters at all when normalizeImage is true — the afterChange
  // hook bails out immediately otherwise (payload.config.ts) — so this dim is only ever
  // a UX hint, never load-bearing, and never blocks clicking either way.
  const { value: normalizeImage } = useField<boolean>({ path: 'normalizeImage' })
  const dimmed = normalizeImage === false

  return (
    <div className="field-type radio-group radio-group--layout-horizontal" style={{ opacity: dimmed ? 0.4 : 1, transition: 'opacity 0.2s' }}>
      <label className="field-label">Canvas Fill</label>
      <div className="field-type__wrap">
        <ul className="radio-group--group">
          {OPTIONS.map((option) => (
            <li key={option.value}>
              <label htmlFor={`field-${path}-${option.value}`}>
                <div className={`radio-input${value === option.value ? ' radio-input--is-selected' : ''}`}>
                  <input
                    checked={value === option.value}
                    id={`field-${path}-${option.value}`}
                    name={path}
                    onChange={() => setValue(option.value)}
                    type="radio"
                  />
                  <span className="radio-input__styled-radio" />
                  <span className="radio-input__label">{option.label}</span>
                </div>
              </label>
            </li>
          ))}
        </ul>
        <p className="field-description">How much of the 1400x1400 canvas the product fills. Spacious adds breathing room; Wide leaves more canvas around the subject.</p>
      </div>
    </div>
  )
}
