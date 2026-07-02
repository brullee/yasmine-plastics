'use client'

import { createLinkedField } from '@/components/payload/LinkedSelectField'

export const LinkedSizesField = createLinkedField({
  formField: 'sizes',
  apiUrl: '/api/sizes?limit=200&depth=0&sort=label',
  docLabelKey: 'label',
  displayLabel: 'Size shown',
  noItemsText: 'No sizes on this product',
  oneItemText: 'Only one size',
})
