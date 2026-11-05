import { APIError, type CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'nameEn' },
  hooks: {
    // Payload doesn't block deletes of referenced docs, so products would lose their category.
    beforeDelete: [
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'products',
          where: { category: { equals: id } },
        })
        if (totalDocs > 0) {
          throw new APIError(
            `Can't delete this category: ${totalDocs} product${totalDocs === 1 ? '' : 's'} still use${totalDocs === 1 ? 's' : ''} it. Reassign or delete ${totalDocs === 1 ? 'it' : 'them'} first.`,
            400,
          )
        }
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
        { name: 'nameAr', label: 'Name (Arabic)', type: 'text', required: true },
      ],
    },
    {
      name: 'slug',
      label: 'Category Slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'The URL name for this category page. Examples: "cups", "food-containers", "papercup-lids". Lowercase only, hyphens(-) instead of spaces.',
        components: { Field: '@/components/payload/LowercaseText#LowercaseText' },
      },
      // Trim first, or edge spaces become hyphens in the URL.
      hooks: { beforeChange: [({ value }) => value?.trim().toLowerCase().replace(/\s+/g, '-')] },
    },
    {
      name: 'slugPrefix',
      label: 'Product Slug',
      type: 'text',
      required: true,
      admin: {
        description: 'Short singular word used to build each product\'s URL code. Examples: "cup" → cup-501, "container" → container-201, "lid" → lid-101. Must be singular (cup, not cups).',
        components: { Field: '@/components/payload/LowercaseText#LowercaseText' },
      },
      // Builds every product URL in this category.
      hooks: { beforeChange: [({ value }) => value?.trim().toLowerCase().replace(/\s+/g, '-')] },
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'defaultMaterial',
      label: 'Default Material',
      type: 'relationship',
      relationTo: 'materials',
      admin: { description: 'Auto-selected when this category is picked on a new product.' },
    },
    {
      name: 'supportsCompatibleLids',
      type: 'checkbox',
      label: 'Support Lid Pairing',
      defaultValue: false,
    },
  ],
}
