import type { CollectionConfig } from 'payload'

export const Sizes: CollectionConfig = {
  slug: 'sizes',
  admin: { useAsTitle: 'label' },
  access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
  // Trimmed for the same reason as Colors.
  hooks: { beforeChange: [({ data }) => {
    if (typeof data.label === 'string') data.label = data.label.trim()
    return data
  }] },
  fields: [
    { name: 'label', label: 'Size', type: 'text', required: true },
  ],
}
