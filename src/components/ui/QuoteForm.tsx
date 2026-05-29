'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useQuoteForm } from '@/hooks/useQuoteForm'
import { products } from '@/data/products'
import type { Locale } from '@/types'
import { localizedName } from '@/lib/utils'

interface Props {
  initialProduct?: string
}

export function QuoteForm({ initialProduct = '' }: Props) {
  const t = useTranslations('quote.form')
  const locale = useLocale() as Locale
  const { form, submitted, handleChange, handleSubmit } = useQuoteForm(initialProduct)

  if (submitted) {
    return (
      <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-8 text-center">
        <p className="text-green-800 dark:text-green-300 font-semibold text-lg">
          {t('success')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="q-firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('firstName')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="q-firstName"
            type="text"
            name="firstName"
            required
            value={form.firstName}
            onChange={handleChange}
            placeholder={t('placeholderFirstName')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="q-lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('lastName')} <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="q-lastName"
            type="text"
            name="lastName"
            required
            value={form.lastName}
            onChange={handleChange}
            placeholder={t('placeholderLastName')}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="q-company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('company')}
        </label>
        <input
          id="q-company"
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder={t('placeholderCompany')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="q-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('email')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="q-email"
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
        <label htmlFor="q-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('phone')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="q-phone"
          type="tel"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
          placeholder={t('placeholderPhone')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="q-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('product')}
        </label>
        <select
          id="q-product"
          name="product"
          value={form.product}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
        >
          <option value="">{t('selectProduct')}</option>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {localizedName(p, locale)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="q-delivery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('delivery')}
        </label>
        <input
          id="q-delivery"
          type="text"
          name="delivery"
          value={form.delivery}
          onChange={handleChange}
          placeholder={t('placeholderDelivery')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="q-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('details')}
        </label>
        <textarea
          id="q-details"
          name="details"
          rows={5}
          value={form.details}
          onChange={handleChange}
          placeholder={t('placeholderDetails')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-blue-500 resize-y min-h-[120px]"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-6 bg-brand-navy text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors"
      >
        {t('submit')}
      </button>
    </form>
  )
}
