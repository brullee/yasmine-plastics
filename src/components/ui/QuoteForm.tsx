'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTheme } from 'next-themes'
import { useQuoteForm } from '@/hooks/useQuoteForm'
import type { Locale, Product, Category } from '@/types'
import { cn, localizedName } from '@/lib/utils'
import { ChipButton, ChipRow } from '@/components/ui/OptionChips'

const CUSTOM = '__custom__'

function SelectChevron() {
  return (
    <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </div>
  )
}

const BASE_INPUT = 'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy'
const inputCls = (hasError: boolean | undefined) =>
  cn(BASE_INPUT, hasError ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-gray-600')

interface Props {
  products: Product[]
  categories: Category[]
}

export function QuoteForm({
  products,
  categories,
}: Props) {
  const searchParams = useSearchParams()
  const initialProduct     = searchParams.get('product')      ?? ''
  const initialColor       = searchParams.get('color')        ?? ''
  const initialSize        = searchParams.get('size')         ?? ''
  const initialLid         = searchParams.get('lid')          ?? ''
  const initialCategory    = searchParams.get('category')     ?? ''
  const initialPartnerColor = searchParams.get('partnerColor') ?? ''
  const initialPartnerSize  = searchParams.get('partnerSize')  ?? ''

  const t = useTranslations('quote.form')
  const tOpts = useTranslations('product.options')
  const tVal = useTranslations('validation')
  const locale = useLocale() as Locale
  const [partnerColor, setPartnerColor] = useState(initialPartnerColor)
  const [partnerSize, setPartnerSize] = useState(initialPartnerSize)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(
    () => initialCategory || products.find(p => p.slug === initialProduct)?.category || ''
  )
  const { form, submitted, submitting, submitError, errors, isFormValid, handleChange, handleBlur, handleSubmit, setField } = useQuoteForm(
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
  const isLid = currentProduct?.category === 'lids' || currentProduct?.category === 'papercup-lids'
  const lidOptions: { slug: string; name: string }[] = isLid
    ? products
        .filter(p => p.compatibleLids?.includes(currentProduct!.slug))
        .map(p => ({ slug: p.slug, name: localizedName(p, locale) }))
    : (currentProduct?.compatibleLids ?? [])
        .map(slug => {
          const p = products.find(p => p.slug === slug)
          return p ? { slug, name: localizedName(p, locale) } : null
        })
        .filter((l): l is { slug: string; name: string } => l !== null)

  const selectedLidProduct = products.find(p => p.slug === form.lid)
  const lidColorOptions = selectedLidProduct?.options.colors ?? []
  const lidSizeOptions = selectedLidProduct?.options.sizes ?? []
  const lidSizeUnit = selectedLidProduct?.options.sizeUnit ?? ''

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
    <form onSubmit={(e) => handleSubmit(e, turnstileToken ?? '', {
        productName: currentProduct ? localizedName(currentProduct, locale) : '',
        lidName: lidOptions.find((l) => l.slug === form.lid)?.name ?? '',
        ...(partnerColor ? { lidColor: partnerColor } : {}),
        ...(partnerSize  ? { lidSize:  partnerSize  } : {}),
      })} noValidate className="space-y-5">
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
        <div className="relative">
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
            className="w-full appearance-none px-4 pe-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy"
          >
            <option value="">{t('selectCategory')}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {localizedName(c, locale)}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </div>

      {/* Product - only shown once a category is picked */}
      {selectedCategory && (
        <div>
          <label htmlFor="q-product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('product')}
          </label>
          <div className="relative">
            <select
              id="q-product"
              name="product"
              value={form.product}
              onChange={(e) => {
                const p = products.find(prod => prod.slug === e.target.value)
                const isLidProduct = p?.category === 'lids' || p?.category === 'papercup-lids'
                const partners = isLidProduct
                  ? products.filter(prod => prod.compatibleLids?.includes(p!.slug))
                  : (p?.compatibleLids ?? []).map(slug => products.find(prod => prod.slug === slug)).filter((x): x is NonNullable<typeof x> => !!x)
                const firstPartner = partners[0]
                setField('product', e.target.value)
                setField('color', p?.options.colors?.[0]?.en ?? '')
                setField('size', p?.options.sizes?.[0] ?? '')
                setField('lid', firstPartner?.slug ?? '')
                setPartnerColor(firstPartner?.options.colors?.[0]?.en ?? '')
                setPartnerSize(firstPartner?.options.sizes?.[0] ?? '')
              }}
              className="w-full appearance-none px-4 pe-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy"
            >
              <option value="">{t('selectProduct')}</option>
              {filteredProducts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {localizedName(p, locale)}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>
      )}

      {/* Product-specific options */}
      {(colorOptions.length > 0 || sizeOptions.length > 0) && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
          {colorOptions.length > 0 && (
            <ChipRow
              label={tOpts('color')}
              value={form.color ? (form.color === CUSTOM ? tOpts('custom') : locale === 'ar' ? (colorOptions.find(c => c.en === form.color)?.ar ?? form.color) : form.color) : undefined}
            >
              {colorOptions.map((color) => (
                <ChipButton key={color.en} active={form.color === color.en} onClick={() => setField('color', color.en)}>
                  {locale === 'ar' ? color.ar : color.en}
                </ChipButton>
              ))}
              <ChipButton custom active={form.color === CUSTOM} onClick={() => setField('color', CUSTOM)}>
                {tOpts('custom')}
              </ChipButton>
            </ChipRow>
          )}
          {sizeOptions.length > 0 && (
            <ChipRow label={tOpts('size')} value={form.size || undefined}>
              {sizeOptions.map((size) => (
                <ChipButton key={size} active={form.size === size} onClick={() => setField('size', size)}>
                  {size}
                </ChipButton>
              ))}
            </ChipRow>
          )}
        </div>
      )}

      {/* Paired product section */}
      {lidOptions.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
          <ChipRow
            label={locale === 'ar' ? 'مرفوق مع' : 'Paired With'}
            value={form.lid ? lidOptions.find(l => l.slug === form.lid)?.name : undefined}
          >
            {lidOptions.map((l) => (
              <ChipButton
                key={l.slug}
                active={form.lid === l.slug}
                onClick={() => {
                  setField('lid', l.slug)
                  const newLid = products.find(p => p.slug === l.slug)
                  setPartnerColor(newLid?.options.colors?.[0]?.en ?? '')
                  setPartnerSize(newLid?.options.sizes?.[0] ?? '')
                }}
              >
                {l.name}
              </ChipButton>
            ))}
            <ChipButton custom active={!form.lid} onClick={() => { setField('lid', ''); setPartnerColor(''); setPartnerSize('') }}>
              {locale === 'ar' ? 'بدون' : 'None'}
            </ChipButton>
          </ChipRow>

          {form.lid && (lidColorOptions.length > 0 || lidSizeOptions.length > 1) && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
              {lidColorOptions.length > 0 && (
                <ChipRow
                  label={locale === 'ar' ? 'لون المرفوق' : 'Paired Color'}
                  value={partnerColor ? (partnerColor === CUSTOM ? tOpts('custom') : locale === 'ar' ? (lidColorOptions.find(c => c.en === partnerColor)?.ar ?? partnerColor) : partnerColor) : undefined}
                >
                  {lidColorOptions.map((color) => (
                    <ChipButton key={color.en} active={partnerColor === color.en} onClick={() => setPartnerColor(color.en)}>
                      {locale === 'ar' ? color.ar : color.en}
                    </ChipButton>
                  ))}
                  <ChipButton custom active={partnerColor === CUSTOM} onClick={() => setPartnerColor(CUSTOM)}>
                    {tOpts('custom')}
                  </ChipButton>
                </ChipRow>
              )}
              {lidSizeOptions.length > 1 && (
                <ChipRow
                  label={locale === 'ar' ? 'مقاس المرفوق' : 'Paired Size'}
                  value={partnerSize ? `${partnerSize}${lidSizeUnit}` : undefined}
                  valueDir="ltr"
                >
                  {lidSizeOptions.map((size) => (
                    <ChipButton key={size} active={partnerSize === size} onClick={() => setPartnerSize(size)}>
                      <span dir="ltr">{size}{lidSizeUnit}</span>
                    </ChipButton>
                  ))}
                </ChipRow>
              )}
            </div>
          )}
        </div>
      )}

      {(form.color === CUSTOM || partnerColor === CUSTOM) && (
        <div className="flex items-start gap-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600/70 rounded-lg px-4 py-3">
          <svg className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{tOpts('moqNotice')}</p>
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
    </form>
  )
}
