'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn, buildWhatsAppUrl, localizedName } from '@/lib/utils'
import { ChipButton, ChipRow } from '@/components/ui/OptionChips'
import { BanIcon, SendIcon, WhatsAppIcon, EyeIcon } from '@/components/ui/Icons'
import { MOQWarning } from '@/components/ui/MOQWarning'
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
        <MOQWarning>{tOpts('moqNotice')}</MOQWarning>
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

