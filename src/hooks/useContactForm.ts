'use client'

import { useState, type FormEvent, type ChangeEvent, type FocusEvent } from 'react'
import type { ContactFormFields } from '@/types'

export type ContactFormErrorCode = 'required' | 'invalidEmail'
export type ContactFormErrors = Partial<Record<keyof ContactFormFields, ContactFormErrorCode>>

type Touched = Partial<Record<keyof ContactFormFields, boolean>>

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

const EMPTY_FORM: ContactFormFields = {
  fullName: '',
  email: '',
  phone: '',
  message: '',
  honeypot: '',
}

export function useContactForm() {
  const [form, setForm] = useState<ContactFormFields>(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Touched>({})

  const errors: ContactFormErrors = {}
  if (touched.fullName && !form.fullName.trim()) errors.fullName = 'required'
  if (touched.email) {
    if (!form.email.trim()) errors.email = 'required'
    else if (!validateEmail(form.email)) errors.email = 'invalidEmail'
  }
  if (touched.message && !form.message.trim()) errors.message = 'required'

  const isFormValid =
    !!form.fullName.trim() &&
    validateEmail(form.email) &&
    !!form.message.trim()

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.honeypot) return
    setTouched({ fullName: true, email: true, message: true })
    if (!isFormValid) return
    console.log('Contact form submission:', { ...form, honeypot: undefined })
    setSubmitted(true)
  }

  function reset() {
    setForm(EMPTY_FORM)
    setSubmitted(false)
    setTouched({})
  }

  return { form, submitted, errors, isFormValid, handleChange, handleBlur, handleSubmit, reset }
}
