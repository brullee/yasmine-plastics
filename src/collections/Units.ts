import type { CollectionConfig } from 'payload'

export const Units: CollectionConfig = {
  slug: 'units',
  admin: { useAsTitle: 'label' },
  access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
  hooks: { beforeChange: [({ data }) => {
    if (typeof data.label === 'string') data.label = data.label.trim()
    return data
  }] },
  fields: [
    { name: 'label', label: 'Unit', type: 'text', required: true },
  ],
}
