'use client'

import { RadioGroupField, useFormFields } from '@payloadcms/ui'
import type { RadioFieldClientComponent } from 'payload'

export const ProcessingModeField: RadioFieldClientComponent = (props) => {
  const normalizeImage = useFormFields(([fields]) => fields.normalizeImage?.value)
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
