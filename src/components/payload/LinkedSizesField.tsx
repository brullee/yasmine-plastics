'use client'

import { createLinkedField } from '@/components/payload/LinkedSelectField'

export const LinkedSizesField = createLinkedField({
  formField: 'sizes',
  apiUrl: '/api/sizes?limit=200&depth=0&sort=label',
  docLabelKey: 'label',
  displayLabel: 'Size shown',
  // Unlike colors, the size chip row is hidden entirely below 2 sizes (ProductActions.tsx), so
  // tagging a single-size product's image is dead: there's no chip that could ever trigger the jump.
  isDisabled: (n) => n <= 1,
  placeholderFor: (n) => n === 0 ? 'No sizes on this product' : n === 1 ? 'Only one size' : 'Select a value',
})
