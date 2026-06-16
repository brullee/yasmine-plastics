import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  plugins: [
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? '',
    }),
  ],
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email' },
      fields: [],
    },
    {
      slug: 'media',
      upload: true,
      access: { read: () => true },
      admin: { useAsTitle: 'filename' },
      fields: [
        { name: 'alt', label: 'Image Description', type: 'text', admin: { description: 'A short description of what\'s in the image. Used by screen readers and shown when the image fails to load. E.g. "White 250ml plastic cup".' } },
      ],
    },
    {
      slug: 'categories',
      admin: { useAsTitle: 'nameEn' },
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
          hooks: { beforeChange: [({ value }) => value?.toLowerCase().replace(/\s+/g, '-')] },
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
          hooks: { beforeChange: [({ value }) => value?.toLowerCase().replace(/\s+/g, '-')] },
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'supportsCompatibleLids',
          type: 'checkbox',
          label: 'Gallery images for products in this category can be paired with a lid',
          defaultValue: false,
        },
      ],
    },
    {
      slug: 'products',
      admin: { useAsTitle: 'nameEn' },
      hooks: {
        beforeChange: [
          async ({ data, req }) => {
            if (data.artCode && data.category) {
              const categoryId = typeof data.category === 'object' && data.category !== null
                ? data.category.id
                : data.category
              if (categoryId) {
                const cat = await req.payload.findByID({ collection: 'categories', id: categoryId })
                const prefix = (cat as Record<string, unknown>).slugPrefix ?? cat.slug
                data.slug = `${prefix}-${data.artCode}`
                data.hasCompatibleLids = !!(cat as Record<string, unknown>).supportsCompatibleLids
              }
            }
            return data
          },
        ],
      },
      fields: [
        { name: 'slug', type: 'text', unique: true, admin: { hidden: true } },
        { name: 'hasCompatibleLids', type: 'checkbox', admin: { hidden: true } },
        {
          name: 'categoryLidSync',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/payload/CategoryLidSync#CategoryLidSync',
            },
          },
        },
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Info',
              fields: [
                {
                  type: 'collapsible',
                  label: 'Names',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
                        { name: 'nameAr', label: 'Name (Arabic)', type: 'text', required: true },
                      ],
                    },
                    {
                      name: 'internalName',
                      label: 'Informal Name',
                      type: 'text',
                      admin: { description: 'The informal name your company uses for this product internally. Not shown to customers.' },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Classification',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
                        { name: 'artCode', type: 'text', required: true, admin: { description: 'Number only, not the full code. E.g. enter "501", not "ART-501".' } },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              label: 'Media',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Main Image' },
                {
                  name: 'gallery',
                  type: 'array',
                  label: 'Additional Images',
                  fields: [
                    { name: 'image', type: 'upload', relationTo: 'media', required: true },
                    {
                      name: 'pairedLid',
                      type: 'relationship',
                      relationTo: 'products',
                      label: 'Paired with',
                      admin: {
                        description: 'Tag this as the pairing shot for a specific compatible lid',
                        condition: (data) => !!data.hasCompatibleLids,
                      },
                      filterOptions: {
                        or: [
                          { 'category.slug': { equals: 'lids' } },
                          { 'category.slug': { equals: 'lid' } },
                          { 'category.slug': { equals: 'papercup-lids' } },
                          { 'category.slug': { equals: 'papercup-lid' } },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Specifications',
              fields: [
                {
                  type: 'collapsible',
                  label: 'General',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      name: 'material',
                      type: 'select',
                      options: [
                        { label: 'PP (Polypropylene)', value: 'PP' },
                        { label: 'PS (Polystyrene)', value: 'PS' },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'capacity', type: 'text', admin: { description: 'Include the unit. E.g. "250ml", "3L".' } },
                        { name: 'piecesPerBox', type: 'number' },
                      ],
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Dimensions',
                  admin: { initCollapsed: false },
                  fields: [
                    {
                      name: 'shapeType',
                      type: 'select',
                      label: 'Shape',
                      options: [
                        { label: 'Circular (φ)', value: 'circular' },
                        { label: 'Rectangular', value: 'rectangular' },
                      ],
                    },
                    {
                      name: 'diameterTop',
                      type: 'number',
                      label: 'Diameter (mm)',
                      admin: { condition: (data) => data.shapeType === 'circular' },
                    },
                    {
                      name: 'diameterBottom',
                      type: 'number',
                      label: 'Bottom Diameter (mm)',
                      admin: { condition: (data) => data.shapeType === 'circular' && data.tapered },
                    },
                    {
                      name: 'tapered',
                      type: 'checkbox',
                      label: 'Tapered (different top & bottom diameter)',
                      admin: { condition: (data) => data.shapeType === 'circular' },
                    },
                    {
                      type: 'row',
                      admin: { condition: (data) => data.shapeType === 'rectangular' },
                      fields: [
                        { name: 'width', type: 'number', label: 'Width (mm)' },
                        { name: 'length', type: 'number', label: 'Length (mm)' },
                      ],
                    },
                    {
                      name: 'height',
                      type: 'number',
                      label: 'Height (mm)',
                      admin: { condition: (data) => !!data.shapeType },
                    },
                  ],
                },
              ],
            },
            {
              label: 'Options',
              fields: [
                {
                  name: 'colors',
                  type: 'array',
                  label: 'Colors',
                  minRows: 1,
                  validate: (value: unknown[] | null | undefined) => !value?.length ? 'At least one color is required' : true,
                  fields: [{ name: 'color', type: 'text', required: true }],
                },
                {
                  name: 'sizes',
                  type: 'array',
                  label: 'Sizes',
                  minRows: 1,
                  validate: (value: unknown[] | null | undefined) => !value?.length ? 'At least one size is required' : true,
                  fields: [{ name: 'size', type: 'text', required: true }],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
})
