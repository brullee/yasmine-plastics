'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTheme } from 'next-themes'
import { useContactForm } from '@/hooks/useContactForm'
import { cn } from '@/lib/utils'

const BASE_INPUT = 'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy'
const inputCls = (hasError: boolean | undefined) =>
  cn(BASE_INPUT, hasError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600')

export function ContactForm() {
  const t = useTranslations('contact.form')
  const tVal = useTranslations('validation')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const { form, submitted, submitting, submitError, errors, isFormValid, handleChange, handleBlur, handleSubmit } = useContactForm()
  const { resolvedTheme } = useTheme()

  if (submitted) {
    return (
      <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 text-center">
        <p className="text-green-800 dark:text-green-300 font-semibold text-lg">
          {t('success')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, turnstileToken ?? '')} noValidate>
      {/* Honeypot — hidden from real users, must stay empty */}
      <input
        type="text"
        name="honeypot"
        value={form.honeypot}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 h-0 w-0 pointer-events-none"
      />
      <div className="space-y-5">

      <div>
        <label htmlFor="contact-fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('fullName')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="contact-fullName"
          type="text"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('placeholderName')}
          className={inputCls(!!errors.fullName)}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{tVal(errors.fullName)}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('email')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('placeholderEmail')}
          className={inputCls(!!errors.email)}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{tVal(errors.email)}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('phone')}
        </label>
        <input
          id="contact-phone"
          type="tel"
          name="phone"
          dir="ltr"
          value={form.phone}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^0-9+\-()\s#*]/g, '')
            handleChange(e)
          }}
          placeholder={t('placeholderPhone')}
          className={cn(inputCls(false), 'rtl:text-right')}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('message')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('placeholderMessage')}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy resize-y min-h-[120px]',
            errors.message ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600',
          )}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{tVal(errors.message)}</p>
        )}
      </div>

      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        options={{ size: "flexible", theme: resolvedTheme === 'dark' ? 'dark' : 'light' }}
        onSuccess={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
      />

      {submitError && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center">{t('error')}</p>
      )}

      <button
        type="submit"
        disabled={!turnstileToken || !isFormValid || submitting}
        className="w-full py-3 px-6 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-navyDark dark:bg-brand-navyDark dark:hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
      </div>
    </form>
  )
}
