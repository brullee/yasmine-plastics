'use client'

import { useState, type FormEvent, type ChangeEvent, type FocusEvent } from 'react'
import type { QuoteFormFields } from '@/types'

export type QuoteFormErrorCode = 'required' | 'invalidEmail' | 'invalidPhone'
export type QuoteFormErrors = Partial<Record<keyof QuoteFormFields, QuoteFormErrorCode>>

type Touched = Partial<Record<keyof QuoteFormFields, boolean>>

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validatePhone(phone: string) {
  return /\d{6,}/.test(phone)
}

function buildInitialForm(
  initialProduct: string,
  initialColor: string,
  initialSize: string,
  initialLid: string,
): QuoteFormFields {
  return {
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    product: initialProduct,
    color: initialColor,
    size: initialSize,
    lid: initialLid,
    delivery: '',
    details: '',
    honeypot: '',
  }
}

export function useQuoteForm(
  initialProduct = '',
  initialColor = '',
  initialSize = '',
  initialLid = '',
) {
  const [form, setForm] = useState<QuoteFormFields>(() =>
    buildInitialForm(initialProduct, initialColor, initialSize, initialLid)
  )
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [touched, setTouched] = useState<Touched>({})

  const errors: QuoteFormErrors = {}
  if (touched.firstName && !form.firstName.trim()) errors.firstName = 'required'
  if (touched.lastName && !form.lastName.trim()) errors.lastName = 'required'
  if (touched.email) {
    if (!form.email.trim()) errors.email = 'required'
    else if (!validateEmail(form.email)) errors.email = 'invalidEmail'
  }
  if (touched.phone) {
    if (!form.phone.trim()) errors.phone = 'required'
    else if (!validatePhone(form.phone)) errors.phone = 'invalidPhone'
  }

  const isFormValid =
    !!form.firstName.trim() &&
    !!form.lastName.trim() &&
    validateEmail(form.email) &&
    validatePhone(form.phone)

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    if (name === 'product') {
      setForm(prev => ({ ...prev, product: value, color: '', size: '', lid: '' }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  function handleBlur(
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  function setField(field: keyof QuoteFormFields, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent, token: string, extras?: Record<string, string>) {
    e.preventDefault()
    if (form.honeypot) return
    setTouched({ firstName: true, lastName: true, email: true, phone: true })
    if (!isFormValid) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...extras, _token: token }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setForm(buildInitialForm(initialProduct, initialColor, initialSize, initialLid))
    setSubmitted(false)
    setTouched({})
  }

  return { form, submitted, submitting, submitError, errors, isFormValid, handleChange, handleBlur, handleSubmit, setField, reset }
}
