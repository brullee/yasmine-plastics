'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn, buildWhatsAppUrl, localizedName } from '@/lib/utils'
import { ChipButton, ChipRow } from '@/components/ui/OptionChips'
import type { Product, Locale } from '@/types'

const CUSTOM = '__custom__'
const NONE_PARTNER = '__none__'



interface Props {
  colors?: { en: string; ar: string }[]
  sizes?: string[]
  sizeUnit?: string
  lids?: Product[]
  fitsContainers?: Product[]
  selectedPartner?: string | null
  onPartnerChange?: (slug: string | null) => void
  onPartnerQuickView?: (slug: string, rect: DOMRect) => void
  selectedColor?: string | null
  onColorChange?: (color: string | null) => void
  selectedSize?: string | null
  onSizeChange?: (size: string | null) => void
  productName: string
  productSlug: string
  whatsappNumber: string
  locale: Locale
}

export function ProductActions({
  colors, sizes, sizeUnit, lids, fitsContainers, selectedPartner, onPartnerChange, onPartnerQuickView,
  selectedColor: controlledColor, onColorChange,
  selectedSize: controlledSize, onSizeChange,
  productName, productSlug, whatsappNumber, locale,
}: Props) {
  const t = useTranslations('product')
  const tOpts = useTranslations('product.options')

  const [internalColor, setInternalColor] = useState<string | null>(colors?.[0]?.en ?? null)
  const [internalSize, setInternalSize] = useState<string | null>(sizes?.[0] ?? null)
  const [partnerColor, setPartnerColor] = useState<string | null>(null)
  const [partnerSize, setPartnerSize] = useState<string | null>(null)

  const selectedColor = onColorChange !== undefined ? (controlledColor ?? null) : internalColor
  const setSelectedColor = onColorChange ?? setInternalColor
  const selectedSize = onSizeChange !== undefined ? (controlledSize ?? null) : internalSize
  const setSelectedSize = onSizeChange ?? setInternalSize

  const colorOptions = colors ?? []
  const selectedPartnerProduct =
    lids?.find((l) => l.slug === selectedPartner) ??
    fitsContainers?.find((c) => c.slug === selectedPartner) ??
    null
  const selectedLidName = selectedPartnerProduct ? localizedName(selectedPartnerProduct, locale) : null

  const partnerColors = selectedPartnerProduct?.options?.colors ?? []
  const partnerSizes = selectedPartnerProduct?.options?.sizes ?? []
  const partnerSizeUnit = selectedPartnerProduct?.options?.sizeUnit

  useEffect(() => {
    setPartnerColor(partnerColors[0]?.en ?? null)
    setPartnerSize(partnerSizes[0] ?? null)
  }, [selectedPartner]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasOptions =
    colorOptions.length > 0 ||
    (sizes?.length ?? 0) > 1 ||
    (lids?.length ?? 0) > 0 ||
    (fitsContainers?.length ?? 0) > 0

  const chatLines = locale === 'ar' ? [
    `مرحباً، أنا مهتم بـ: ${productName} (${productSlug})`,
    ...(selectedColor ? [`اللون: ${selectedColor === CUSTOM ? 'مخصص' : (colorOptions.find(c => c.en === selectedColor)?.ar ?? selectedColor)}`] : []),
    ...(selectedSize ? [`المقاس: ${selectedSize}`] : []),
    ...(selectedLidName ? [`المرافق: ${selectedLidName} (${selectedPartner})`] : []),
    ...(partnerColor ? [`لون المرافق: ${partnerColor === CUSTOM ? 'مخصص' : (partnerColors.find(c => c.en === partnerColor)?.ar ?? partnerColor)}`] : []),
    ...(partnerSize ? [`مقاس المرافق: ${partnerSize}`] : []),
  ] : [
    `Hi, I'm interested in: ${productName} (${productSlug})`,
    ...(selectedColor ? [`Color: ${selectedColor === CUSTOM ? 'Custom' : selectedColor}`] : []),
    ...(selectedSize ? [`Size: ${selectedSize}`] : []),
    ...(selectedLidName ? [`Paired: ${selectedLidName} (${selectedPartner})`] : []),
    ...(partnerColor ? [`Paired Color: ${partnerColor === CUSTOM ? 'Custom' : partnerColor}`] : []),
    ...(partnerSize ? [`Paired Size: ${partnerSize}`] : []),
  ]
  const chatUrl = buildWhatsAppUrl(whatsappNumber, chatLines.join('\n'))

  function togglePartner(slug: string) {
    onPartnerChange?.(slug)
  }

  const partnerOptions = selectedPartnerProduct && (partnerColors.length > 0 || partnerSizes.length > 1) ? (
    <div className="mt-3 space-y-4">
      {partnerColors.length > 0 && (
        <ChipRow
          label={locale === 'ar' ? 'لون المرفوق' : 'Paired Color'}
          value={partnerColor ? (partnerColor === CUSTOM ? tOpts('custom') : locale === 'ar' ? (partnerColors.find(c => c.en === partnerColor)?.ar ?? partnerColor) : partnerColor) : undefined}
        >
          {partnerColors.map((color) => (
            <ChipButton key={color.en} active={partnerColor === color.en} onClick={() => setPartnerColor(color.en)}>
              {locale === 'ar' ? color.ar : color.en}
            </ChipButton>
          ))}
          <ChipButton custom active={partnerColor === CUSTOM} onClick={() => setPartnerColor(CUSTOM)}>
            {tOpts('custom')}
          </ChipButton>
        </ChipRow>
      )}
      {partnerSizes.length > 1 && (
        <ChipRow
          label={locale === 'ar' ? 'مقاس المرفوق' : 'Paired Size'}
          value={partnerSize ? `${partnerSize}${partnerSizeUnit ?? ''}` : undefined}
          valueDir="ltr"
        >
          {partnerSizes.map((size) => (
            <ChipButton key={size} active={partnerSize === size} onClick={() => setPartnerSize(size)}>
              <span dir="ltr">{size}{partnerSizeUnit ?? ''}</span>
            </ChipButton>
          ))}
        </ChipRow>
      )}
    </div>
  ) : null

  return (
    <>
      {hasOptions && (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-5 space-y-5 border border-gray-200 dark:border-gray-700">

          {/* Compatible containers (shown on lid pages) */}
          {fitsContainers && fitsContainers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{locale === 'ar' ? 'مرفوق مع' : 'Paired With'}</p>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPartner === NONE_PARTNER ? (locale === 'ar' ? 'بدون' : 'None') : selectedLidName}
                </span>
              </div>
              <PartnerGrid products={fitsContainers} selectedSlug={selectedPartner ?? null} locale={locale} onSelect={togglePartner} onQuickView={onPartnerQuickView} />
              {partnerOptions}
            </div>
          )}

          {/* Compatible lids (shown on container/bucket pages) */}
          {lids && lids.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{locale === 'ar' ? 'مرفوق مع' : 'Paired With'}</p>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPartner === NONE_PARTNER ? (locale === 'ar' ? 'بدون' : 'None') : selectedLidName}
                </span>
              </div>
              <PartnerGrid products={lids} selectedSlug={selectedPartner ?? null} locale={locale} onSelect={togglePartner} onQuickView={onPartnerQuickView} />
              {partnerOptions}
            </div>
          )}

          {/* Colors */}
          {colorOptions.length > 0 && (
            <div className={cn(!!(lids?.length || fitsContainers?.length) && 'border-t border-gray-200 dark:border-gray-700 pt-5')}>
              <ChipRow
                label={tOpts('color')}
                value={selectedColor ? (selectedColor === CUSTOM ? tOpts('custom') : locale === 'ar' ? (colorOptions.find(c => c.en === selectedColor)?.ar ?? selectedColor) : selectedColor) : undefined}
              >
                {colorOptions.map((color) => (
                  <ChipButton key={color.en} active={selectedColor === color.en} onClick={() => setSelectedColor(color.en)}>
                    {locale === 'ar' ? color.ar : color.en}
                  </ChipButton>
                ))}
                <ChipButton custom active={selectedColor === CUSTOM} onClick={() => setSelectedColor(CUSTOM)}>
                  {tOpts('custom')}
                </ChipButton>
              </ChipRow>
            </div>
          )}

          {/* Sizes */}
          {sizes && sizes.length > 1 && (
            <ChipRow
              label={tOpts('size')}
              value={selectedSize ? `${selectedSize}${sizeUnit ?? ''}` : undefined}
              valueDir="ltr"
            >
              {sizes.map((size) => (
                <ChipButton key={size} active={selectedSize === size} onClick={() => setSelectedSize(size)}>
                  <span dir="ltr">{size}{sizeUnit ?? ''}</span>
                </ChipButton>
              ))}
            </ChipRow>
          )}

        </div>
      )}

      {/* MOQ notice — shown once if any custom color is selected */}
      {(selectedColor === CUSTOM || partnerColor === CUSTOM) && (
        <div className="flex items-start gap-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600/70 rounded-lg px-4 py-3">
          <svg className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{tOpts('moqNotice')}</p>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Link
          href={(() => {
            const p = new URLSearchParams()
            const hasPartner = selectedPartner && selectedPartner !== NONE_PARTNER
            if (fitsContainers?.length && hasPartner) {
              // On a lid page: send inquiry as if the container is the product + this lid is the accessory
              p.set('product', selectedPartner!)
              p.set('lid', productSlug)
            } else {
              p.set('product', productSlug)
              if (hasPartner) p.set('lid', selectedPartner!)
            }
            if (selectedColor) p.set('color', selectedColor)
            if (selectedSize) p.set('size', selectedSize)
            if (partnerColor) p.set('partnerColor', partnerColor)
            if (partnerSize) p.set('partnerSize', partnerSize)
            return `/quote?${p.toString()}`
          })()}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-brand-navy text-white font-semibold rounded-xl hover:bg-brand-navyDark transition-colors"
        >
          <SendIcon />
          {t('sendInquiry')}
        </Link>
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 bg-white dark:bg-gray-800 text-brand-navy dark:text-white font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700"
        >
          <WhatsAppIcon />
          {t('chatNow')}
        </a>
      </div>
    </>
  )
}

function PartnerGrid({ products, selectedSlug, locale, onSelect, onQuickView }: {
  products: Product[]
  selectedSlug: string | null
  locale: Locale
  onSelect: (slug: string) => void
  onQuickView?: (slug: string, rect: DOMRect) => void
}) {
  const noneSelected = selectedSlug === NONE_PARTNER
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {products.map((p) => {
        const name = localizedName(p, locale)
        const isSelected = selectedSlug === p.slug
        return (
          <div
            key={p.slug}
            className={cn(
              'group flex items-center gap-2 rounded-lg border transition-colors',
              isSelected
                ? 'border-brand-navy bg-brand-sky dark:border-sky-400 dark:bg-sky-900/30'
                : 'bg-gray-100 dark:bg-transparent border-gray-400 dark:border-gray-500 hover:border-brand-navy dark:hover:border-blue-400'
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(p.slug)}
              className="flex items-center gap-2 flex-1 min-w-0 p-1.5 text-start"
            >
              <div data-thumb className="relative w-8 h-8 rounded-md overflow-hidden bg-white flex-shrink-0">
                <Image src={p.image} alt={name} fill sizes="32px" className="object-contain p-1" />
              </div>
              <span className={cn(
                'text-xs font-medium leading-snug',
                isSelected
                  ? 'text-brand-navy dark:text-sky-200'
                  : 'text-gray-700 dark:text-gray-300 group-hover:text-brand-navy dark:group-hover:text-white'
              )}>
                {name}
              </span>
            </button>
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  const thumb = e.currentTarget.closest('div')?.querySelector('[data-thumb]')
                  const rect = (thumb ?? e.currentTarget).getBoundingClientRect()
                  onQuickView(p.slug, rect)
                }}
                aria-label={locale === 'ar' ? `معاينة ${name}` : `Quick view ${name}`}
                className={cn(
                  'flex-shrink-0 p-2 me-1.5 rounded-md transition-colors',
                  isSelected
                    ? 'text-brand-navy dark:text-sky-400 hover:bg-brand-navy/10 dark:hover:bg-sky-400/10'
                    : 'text-gray-400 dark:text-gray-400 hover:text-brand-navy dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                <EyeIcon />
              </button>
            )}
          </div>
        )
      })}
      <div
        className={cn(
          'flex items-center rounded-lg border transition-colors',
          noneSelected
            ? 'border-brand-navy bg-brand-sky dark:border-sky-400 dark:bg-sky-900/30'
            : 'bg-gray-100 dark:bg-transparent border-dashed border-gray-400 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-400'
        )}
      >
        <button
          type="button"
          onClick={() => onSelect(NONE_PARTNER)}
          className="flex items-center gap-2 flex-1 min-w-0 p-1.5 text-start"
        >
          <div className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
            noneSelected
              ? 'bg-brand-navy/10 text-brand-navy dark:bg-sky-400/10 dark:text-sky-400'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-300'
          )}>
            <BanIcon />
          </div>
          <span className={cn(
            'text-xs font-medium',
            noneSelected
              ? 'text-brand-navy dark:text-sky-200'
              : 'text-gray-700 dark:text-gray-300'
          )}>
            {locale === 'ar' ? 'بدون' : 'None'}
          </span>
        </button>
      </div>
    </div>
  )
}

function BanIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
