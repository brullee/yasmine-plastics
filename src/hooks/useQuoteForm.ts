'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import type { QuoteFormFields } from '@/types'

function buildInitialForm(initialProduct: string): QuoteFormFields {
  return {
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    product: initialProduct,
    delivery: '',
    details: '',
    honeypot: '',
  }
}

export function useQuoteForm(initialProduct = '') {
  const [form, setForm] = useState<QuoteFormFields>(() =>
    buildInitialForm(initialProduct)
  )
  const [submitted, setSubmitted] = useState(false)

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.honeypot) return
    console.log('Quote form submission:', { ...form, honeypot: undefined })
    setSubmitted(true)
  }

  function reset() {
    setForm(buildInitialForm(initialProduct))
    setSubmitted(false)
  }

  return { form, submitted, handleChange, handleSubmit, reset }
}
