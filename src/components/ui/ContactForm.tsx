'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useContactForm } from '@/hooks/useContactForm'
import { company } from '@/data/company'
import { buildWhatsAppUrl } from '@/lib/utils'

export function ContactForm() {
  const t = useTranslations('contact.form')
  const tWip = useTranslations('wip')
  const locale = useLocale()
  const { form, submitted, handleChange, handleSubmit } = useContactForm()

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
      <div className="rounded-xl bg-brand-sky dark:bg-blue-950 px-4 py-3">
        <p className="text-sm text-brand-navy dark:text-blue-200">
          {tWip('formNotice')}{' '}
          <a
            href={buildWhatsAppUrl(company.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact via WhatsApp"
            className="font-semibold text-brand-blue dark:text-blue-400 hover:underline"
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
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
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
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
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
          onChange={handleChange}
          placeholder={t('placeholderPhone')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500 rtl:text-right"
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
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500 resize-y min-h-[120px]"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-6 bg-brand-navy text-white font-semibold rounded-lg hover:bg-blue-900 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
      >
        {t('submit')}
      </button>
    </form>
  )
}
