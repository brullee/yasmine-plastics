'use client'

import { createLinkedField } from '@/components/payload/LinkedSelectField'

export const LinkedColorsField = createLinkedField({
  formField: 'colors',
  apiUrl: '/api/colors?limit=200&depth=0&sort=nameEn',
  docLabelKey: 'nameEn',
  displayLabel: 'Color shown',
  description: 'Selecting these color/size options on the product page jumps to this image.',
  // The color chip row always renders on the product page, even with a single color (plus the
  // always-present Custom chip), so tagging is only pointless when there are zero colors at all.
  isDisabled: (n) => n === 0,
  placeholderFor: (n) => n === 0 ? 'No colors on this product' : 'Select a value',
})
