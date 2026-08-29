interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export function FormField({ id, label, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <> <span aria-hidden="true" className="text-red-500">*</span></>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
