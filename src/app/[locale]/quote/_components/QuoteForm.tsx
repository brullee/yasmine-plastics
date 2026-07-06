'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTheme } from 'next-themes'
import { useQuoteForm } from '@/hooks/useQuoteForm'
import type { Locale, Product, Category } from '@/types'
import { cn, localizedName } from '@/lib/utils'
import { button } from '@/lib/theme'
import { ChipButton, ChipRow } from '@/components/ui/OptionChips'
import { MOQWarning } from '@/components/ui/MOQWarning'
import { SuccessBox } from '@/components/ui/SuccessBox'
import { FormField } from '@/components/ui/FormField'

const CUSTOM = '__custom__'

function SelectChevron() {
  return (
    <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center">
      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
    return <SuccessBox>{t('success')}</SuccessBox>
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

      <FormField id="q-fullName" label={t('fullName')} required error={errors.fullName ? tVal(errors.fullName) : undefined}>
        <input
          id="q-fullName"
          type="text"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('placeholderFullName')}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'q-fullName-error' : undefined}
          className={inputCls(!!errors.fullName)}
        />
      </FormField>

      <FormField id="q-company" label={t('company')}>
        <input
          id="q-company"
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder={t('placeholderCompany')}
          className={inputCls(false)}
        />
      </FormField>

      <FormField id="q-email" label={t('email')} required error={errors.email ? tVal(errors.email) : undefined}>
        <input
          id="q-email"
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('placeholderEmail')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'q-email-error' : undefined}
          className={inputCls(!!errors.email)}
        />
      </FormField>

      <FormField id="q-phone" label={t('phone')} required error={errors.phone ? tVal(errors.phone) : undefined}>
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
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'q-phone-error' : undefined}
          className={cn(inputCls(!!errors.phone), 'rtl:text-right')}
        />
      </FormField>

      {/* Category */}
      <FormField id="q-category" label={t('category')}>
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
      </FormField>

      {/* Product - only shown once a category is picked */}
      {selectedCategory && (
        <FormField id="q-product" label={t('product')}>
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
        </FormField>
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
            <div className="space-y-4">
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
        <MOQWarning>{tOpts('moqNotice')}</MOQWarning>
      )}

      <FormField id="q-delivery" label={t('delivery')}>
        <input
          id="q-delivery"
          type="text"
          name="delivery"
          value={form.delivery}
          onChange={handleChange}
          placeholder={t('placeholderDelivery')}
          className={inputCls(false)}
        />
      </FormField>

      <FormField id="q-details" label={t('details')}>
        <textarea
          id="q-details"
          name="details"
          rows={5}
          value={form.details}
          onChange={handleChange}
          placeholder={t('placeholderDetails')}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-navy dark:focus:ring-brand-navy resize-y min-h-[120px]"
        />
      </FormField>

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
        className={cn('w-full py-3 px-6 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed', button.primary)}
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
