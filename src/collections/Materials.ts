import type { CollectionConfig } from 'payload'

export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: { useAsTitle: 'name' },
  access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
  ],
}
