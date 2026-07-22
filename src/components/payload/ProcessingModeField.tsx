'use client'

import { RadioGroupField, useField } from '@payloadcms/ui'
import type { RadioFieldClientComponent } from 'payload'

export const ProcessingModeField: RadioFieldClientComponent = (props) => {
  // Reading normalizeImage's live value here has repeatedly proven unreliable inside
  // Bulk Upload's per-file form specifically (its form state gets replaced wholesale by
  // async server round-trips in ways plain single uploads never hit) — three separate
  // attempts at correctly detecting "is it really off" all still greyed out sometimes in
  // production. But processingMode only matters at all when normalizeImage is true — the
  // afterChange hook bails out immediately otherwise (payload.config.ts) — so disabling
  // interaction here was only ever a UX hint, never load-bearing. Keep the dim as a
  // best-effort visual hint, but never block clicking: worst case is a picker that looks
  // slightly dim when it shouldn't, not one that's actually stuck unusable.
  const { value: normalizeImage } = useField<boolean>({ path: 'normalizeImage' })
  const dimmed = normalizeImage === false

  return (
    <div style={{ opacity: dimmed ? 0.4 : 1, transition: 'opacity 0.2s' }}>
      <RadioGroupField {...props} />
    </div>
  )
}
