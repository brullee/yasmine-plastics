'use client'

import { RadioGroupField, useField } from '@payloadcms/ui'
import type { RadioFieldClientComponent } from 'payload'

export const ProcessingModeField: RadioFieldClientComponent = (props) => {
  // Bulk Upload's per-file form (unlike the normal single-upload Create view) fires a
  // full server round-trip (getFormState) on every change, including on mount, and
  // wholesale-replaces local form state with the response — see EditForm/index.js in
  // @payloadcms/ui. Reading normalizeImage's value while that round-trip is still in
  // flight can show a value that hasn't been confirmed back from the server yet, which
  // is what left this stuck disabled (worse on slower connections/mobile, since a
  // slower round-trip means a longer window where the value can't be trusted). `disabled`
  // here is useField's own formProcessing/formInitializing signal — never grey out while
  // the form itself is still settling, only once it's confirmed idle.
  const { value: normalizeImage, disabled: formBusy } = useField<boolean>({ path: 'normalizeImage' })
  const disabled = !formBusy && normalizeImage === false

  return (
    <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
      <RadioGroupField {...props} />
    </div>
  )
}
