'use client'

import { FieldDescription, FieldError, FieldLabel, TextInput, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

export const LowercaseText: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })

  const description =
    field.admin && 'description' in field.admin && typeof field.admin.description === 'string'
      ? field.admin.description
      : undefined

  return (
    <div className="field-type text">
      <FieldLabel label={field.label} path={path} required={field.required} />
      <TextInput
        path={path}
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
        readOnly={readOnly}
        showError={showError}
        field={field}
      />
      <FieldError path={path} showError={showError} message={errorMessage ?? undefined} />
      {description && <FieldDescription path={path} description={description} />}
    </div>
  )
}
