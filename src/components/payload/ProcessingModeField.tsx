'use client'

import { RadioGroupField, useFormFields } from '@payloadcms/ui'
import type { RadioFieldClientComponent } from 'payload'

export const ProcessingModeField: RadioFieldClientComponent = (props) => {
  const normalizeImage = useFormFields(([fields]) => fields.normalizeImage?.value)
  const disabled = !normalizeImage

  return (
    <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
      <RadioGroupField {...props} />
    </div>
  )
}
