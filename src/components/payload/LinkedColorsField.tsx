'use client'

import { createLinkedField } from '@/components/payload/LinkedSelectField'

export const LinkedColorsField = createLinkedField({
  formField: 'colors',
  apiUrl: '/api/colors?limit=200&depth=0&sort=nameEn',
  docLabelKey: 'nameEn',
  displayLabel: 'Color shown',
  noItemsText: 'No colors on this product',
  oneItemText: 'Only one color',
  description: 'Selecting these color/size options on the product page jumps to this image.',
})
