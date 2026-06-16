'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTheme } from 'next-themes'
import { useQuoteForm } from '@/hooks/useQuoteForm'
import type { Locale, Product, Category } from '@/types'
import { cn, localizedName, buildWhatsAppUrl } from '@/lib/utils'
import { company } from '@/data/company'

const CUSTOM = '__custom__'

const BASE_INPUT = 'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy'
const inputCls = (hasError: boolean | undefined) =>
  cn(BASE_INPUT, hasError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600')

interface Props {
  products: Product[]
  categories: Category[]
  initialProduct?: string
  initialColor?: string
  initialSize?: string
  initialLid?: string
}

export function QuoteForm({
  products,
  categories,
  initialProduct = '',
  initialColor = '',
  initialSize = '',
  initialLid = '',
}: Props) {
  const t = useTranslations('quote.form')
  const tOpts = useTranslations('product.options')
  const tVal = useTranslations('validation')
  const tWip = useTranslations('wip')
  const locale = useLocale() as Locale
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(
    () => products.find(p => p.slug === initialProduct)?.category ?? ''
  )
  const { form, submitted, errors, isFormValid, handleChange, handleBlur, handleSubmit, setField } = useQuoteForm(
    initialProduct,
    initialColor,
    initialSize,
    initialLid,
  )
  const { resolvedTheme } = useTheme()

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products

  // Derive option lists from whichever product is currently selected
  const currentProduct = products.find(p => p.slug === form.product)
  const colorOptions = currentProduct?.options.colors ?? []
  const sizeOptions = currentProduct?.options.sizes ?? []
  const lidOptions = (currentProduct?.compatibleLids ?? [])
    .map(slug => {
      const p = products.find(p => p.slug === slug)
      return p ? { slug, name: localizedName(p, locale) } : null
    })
    .filter((l): l is { slug: string; name: string } => l !== null)

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
            onBlur={handleBlur}
            placeholder={t('placeholderFirstName')}
            className={inputCls(!!errors.firstName)}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{tVal(errors.firstName)}</p>
          )}
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
            onBlur={handleBlur}
            placeholder={t('placeholderLastName')}
            className={inputCls(!!errors.lastName)}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{tVal(errors.lastName)}</p>
          )}
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
          className={inputCls(false)}
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
          onBlur={handleBlur}
          placeholder={t('placeholderEmail')}
          className={inputCls(!!errors.email)}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{tVal(errors.email)}</p>
        )}
      </div>

      <div>
        <label htmlFor="q-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('phone')} <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="q-phone"
          type="tel"
          name="phone"
          dir="ltr"
          required
          value={form.phone}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^0-9+\-()\s#*]/g, '')
            handleChange(e)
          }}
          onBlur={handleBlur}
          placeholder={t('placeholderPhone')}
          className={cn(inputCls(!!errors.phone), 'rtl:text-right')}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{tVal(errors.phone)}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="q-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('category')}
        </label>
        <select
          id="q-category"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setField('product', '')
            setField('color', '')
            setField('size', '')
            setField('lid', '')
          }}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy"
        >
          <option value="">{t('selectCategory')}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {localizedName(c, locale)}
            </option>
          ))}
        </select>
      </div>

      {/* Product — only shown once a category is picked */}
      {selectedCategory && (
        <div>
          <label htmlFor="q-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('product')}
          </label>
          <select
            id="q-product"
            name="product"
            value={form.product}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy"
          >
            <option value="">{t('selectProduct')}</option>
            {filteredProducts.map((p) => (
              <option key={p.slug} value={p.slug}>
                {localizedName(p, locale)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Product-specific options — shown only when the selected product has them */}
      {(colorOptions.length > 0 || sizeOptions.length > 0 || lidOptions.length > 0) && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">

          {colorOptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{tOpts('color')}</p>
                {form.color && form.color !== CUSTOM && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{form.color}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setField('color', color)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                      form.color === color
                        ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                        : 'bg-gray-50 dark:bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:hover:border-gray-400 dark:hover:text-white'
                    )}
                  >
                    {color}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setField('color', CUSTOM)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                    form.color === CUSTOM
                      ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                      : 'bg-gray-50 dark:bg-transparent border-dashed border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:border-gray-500 hover:bg-gray-100 dark:hover:border-gray-300 dark:hover:text-gray-200'
                  )}
                >
                  {tOpts('custom')}
                </button>
              </div>
              {form.color === CUSTOM && (
                <div className="mt-2 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-2">
                  <svg className="mt-0.5 shrink-0 text-amber-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{tOpts('moqNoticeForm')}</p>
                </div>
              )}
            </div>
          )}

          {sizeOptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{tOpts('size')}</p>
                {form.size && <span className="text-sm text-gray-500 dark:text-gray-400">{form.size}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setField('size', size)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                      form.size === size
                        ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                        : 'bg-gray-50 dark:bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:hover:border-gray-400 dark:hover:text-white'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {lidOptions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{tOpts('lid')}</p>
                {form.lid && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {lidOptions.find(l => l.slug === form.lid)?.name}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {lidOptions.map((l) => (
                  <button
                    key={l.slug}
                    type="button"
                    onClick={() => setField('lid', l.slug)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                      form.lid === l.slug
                        ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
                        : 'bg-gray-50 dark:bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:hover:border-gray-400 dark:hover:text-white'
                    )}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
          className={inputCls(false)}
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
        disabled={!turnstileToken || !isFormValid}
        className="w-full py-3 px-6 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-navyDark dark:bg-brand-navyDark dark:hover:bg-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('submit')}
      </button>
    </form>
  )
}
