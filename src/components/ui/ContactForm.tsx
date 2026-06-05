'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTheme } from 'next-themes'
import { useContactForm } from '@/hooks/useContactForm'
import { company } from '@/data/company'
import { buildWhatsAppUrl } from '@/lib/utils'

export function ContactForm() {
  const t = useTranslations('contact.form')
  const tWip = useTranslations('wip')
  const locale = useLocale()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const { form, submitted, handleChange, handleSubmit } = useContactForm()
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
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* WIP notice */}
      <div className="rounded-xl bg-brand-sky dark:bg-brand-navyDark px-4 py-3">
        <p className="text-sm text-brand-navy dark:text-gray-300">
          {tWip('formNotice')}{' '}
          <a
            href={buildWhatsAppUrl(company.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
          >
            {tWip('formWhatsAppCta')}
          </a>
        </p>
      </div>

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
          placeholder={t('placeholderName')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy"
        />
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
          placeholder={t('placeholderEmail')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy"
        />
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
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy rtl:text-right"
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
          placeholder={t('placeholderMessage')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy resize-y min-h-[120px]"
        />
      </div>

      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        options={{ size: "flexible", theme: resolvedTheme === 'dark' ? 'dark' : 'light' }}
        onSuccess={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
      />

      <button
        type="submit"
        disabled={!turnstileToken}
        className="w-full py-3 px-6 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-navyDark dark:bg-brand-navyDark dark:hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('submit')}
      </button>
    </form>
  )
}
