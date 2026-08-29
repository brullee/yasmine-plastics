import type { Locale, Product } from '@/types'

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function localizedName(
  item: { nameEn: string; nameAr: string },
  locale: Locale
): string {
  return locale === 'ar' ? item.nameAr : item.nameEn
}


export function buildWhatsAppUrl(phone: string, message?: string): string {
  const clean = phone.replace(/[^0-9]/g, '')
  const encoded = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${encoded}`
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Modal scroll lock shared by QuickViewModal and ProductImageLightbox. Blocks the
// input events that cause scrolling (wheel, touch, scroll-relevant keys) instead of
// touching overflow/position - both were tried and rejected first: `overflow: hidden`
// on body detaches the sticky header (confirmed live - it jumps off-screen by the
// current scroll offset, not just a stale comment), and `position: fixed` needs a
// scrollbar-width compensation that leaves a visible color seam wherever a full-bleed
// section doesn't happen to match body's own background. Blocking events instead
// means nothing about layout ever changes - no reflow, no seam, header undisturbed -
// confirmed live via Playwright before landing on this.
// `allowedEl`, if given, is a scrollable region inside the modal itself (e.g.
// QuickViewModal's info panel) that should keep scrolling normally.
// Known limitation, unavoidable with this technique: the background scrollbar stays
// visible but goes inert - dragging its thumb directly (not wheel/touch/keys) isn't
// caught by any of these events. Accepted over the alternatives' worse trade-offs.
export function lockBodyScroll(allowedEl?: Element | null): () => void {
  const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])
  const insideAllowed = (target: EventTarget | null) =>
    !!allowedEl && target instanceof Node && allowedEl.contains(target)

  const onWheel = (e: WheelEvent) => { if (!insideAllowed(e.target)) e.preventDefault() }
  const onTouchMove = (e: TouchEvent) => { if (!insideAllowed(e.target)) e.preventDefault() }
  const onKeyDown = (e: KeyboardEvent) => {
    if (SCROLL_KEYS.has(e.key) && !insideAllowed(document.activeElement)) e.preventDefault()
  }

  window.addEventListener('wheel', onWheel, { passive: false, capture: true })
  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
  window.addEventListener('keydown', onKeyDown, { capture: true })

  return () => {
    window.removeEventListener('wheel', onWheel, { capture: true })
    window.removeEventListener('touchmove', onTouchMove, { capture: true })
    window.removeEventListener('keydown', onKeyDown, { capture: true })
  }
}

export function deriveCapacityParts(
  product: Pick<Product, 'capacity' | 'capacityAutoGenerate' | 'options'>
): { range: string; unit: string } | undefined {
  if (product.capacityAutoGenerate === false) {
    const raw = product.capacity?.replace(/\s*-\s*/g, '-').replace(/\s+/g, '')
    if (!raw) return undefined
    const match = raw.match(/^([\d.,/-]+)(.*)$/)
    return match ? { range: match[1], unit: match[2] } : { range: raw, unit: '' }
  }
  const sizes = product.options.sizes
  const unit = product.options.sizeUnit ?? ''
  if (!sizes?.length) return undefined
  const nums = sizes.map(s => parseFloat(s)).filter(n => !isNaN(n)).sort((a, b) => a - b)
  if (!nums.length) return undefined
  const range = nums.length === 1 ? `${nums[0]}` : `${nums[0]}-${nums[nums.length - 1]}`
  return { range, unit }
}

export function deriveCapacity(
  product: Pick<Product, 'capacity' | 'capacityAutoGenerate' | 'options'>
): string | undefined {
  const parts = deriveCapacityParts(product)
  return parts ? `${parts.range}${parts.unit}` : undefined
}
