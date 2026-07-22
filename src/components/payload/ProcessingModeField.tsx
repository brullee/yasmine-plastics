'use client'

import { RadioGroupField, useField } from '@payloadcms/ui'
import type { RadioFieldClientComponent } from 'payload'

export const ProcessingModeField: RadioFieldClientComponent = (props) => {
  // useFormFields' selector-based subscription lagged behind the Normalized checkbox's
  // own state in bulk uploads (checkbox showed on, this still read stale/false) — switched
  // to useField, reading the same 'normalizeImage' path directly the same way
  // NormalizingIndicator.tsx already does for this exact field, which never had this problem.
  const { value: normalizeImage } = useField<boolean>({ path: 'normalizeImage' })
  // Only disable on an explicit "off" — in the Bulk Upload "edit fields for all files"
  // panel, `normalizeImage` is simply absent (not `false`) unless the admin also
  // selected the "Normalized" field there, which used to leave this stuck disabled.
  const disabled = normalizeImage === false

  return (
    <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
      <RadioGroupField {...props} />
    </div>
  )
}
