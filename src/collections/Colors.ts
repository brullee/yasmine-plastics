import type { CollectionConfig } from 'payload'

export const Colors: CollectionConfig = {
  slug: 'colors',
  admin: { useAsTitle: 'nameEn' },
  access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
  // Trimmed because the storefront matches images to options by name, and "Red " != "Red".
  hooks: { beforeChange: [({ data }) => {
    if (typeof data.nameEn === 'string') data.nameEn = data.nameEn.trim()
    if (typeof data.nameAr === 'string') data.nameAr = data.nameAr.trim()
    return data
  }] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
        { name: 'nameAr', label: 'Name (Arabic)', type: 'text' },
      ],
    },
  ],
}
