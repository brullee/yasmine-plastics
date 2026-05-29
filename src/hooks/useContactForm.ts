'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import type { ContactFormFields } from '@/types'

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

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (form.honeypot) return
    console.log('Contact form submission:', { ...form, honeypot: undefined })
    setSubmitted(true)
  }

  function reset() {
    setForm(EMPTY_FORM)
    setSubmitted(false)
  }

  return { form, submitted, handleChange, handleSubmit, reset }
}
