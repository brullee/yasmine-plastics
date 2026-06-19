import path from 'path'
import { after } from 'next/server'
import { buildConfig } from 'payload'
import { normalizeMediaAfterUpload } from '@/lib/image-normalize'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { forgotPasswordEmailHtml } from '@/lib/emailTemplates'

const pendingNormalize = new Set<string>()

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  i18n: {
    translations: {
      en: { general: { noLabel: '–' } },
      ar: { general: { noLabel: '–' } },
    },
  },
  email: resendAdapter({
    defaultFromAddress: process.env.MAIL_FROM_NOREPLY ?? 'onboarding@resend.dev',
    defaultFromName: 'Yasmine Plastics',
    apiKey: process.env.RESEND_API_KEY ?? '',
  }),
  admin: {
    user: 'users',
    components: {
      providers: [
        '@/components/payload/ClientImageCompressor#ClientImageCompressorProvider',
      ],
    },
  },
  plugins: [
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename }) =>
            `${process.env.R2_PUBLIC_URL ?? ''}/${filename}`,
        },
      },
      bucket: process.env.R2_BUCKET ?? '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
        },
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT ?? '',
      },
    }),
  ],
  collections: [
    {
      slug: 'users',
      auth: {
        forgotPassword: {
          generateEmailHTML: (args) => {
            const token = args?.token ?? ''
            const user = args?.user
            const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
            const resetURL = `${serverURL}/admin/reset/${token}`
            return forgotPasswordEmailHtml({ resetURL, userEmail: String((user as { email?: string }).email ?? '') })
          },
        },
      },
      admin: { useAsTitle: 'email' },
      fields: [],
    },
    {
      slug: 'media',
      upload: {
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
      },
      access: { read: () => true },
      admin: {
        useAsTitle: 'filename',
        description: 'Images are compressed automatically on upload.',
      },
      hooks: {
        afterChange: [
          async ({ doc, operation, previousDoc, req }) => {
            if (!doc.normalizeImage || !doc.filename) return
            const docIdStr = String(doc.id)

            if (operation === 'create') {
              // File reaches R2 after create hooks complete; flag here and
              // process on the auto-update Payload fires right after.
              pendingNormalize.add(docIdStr)
              return
            }

            if (operation !== 'update') return

            const isPostCreateUpdate = pendingNormalize.has(docIdStr)
            // File replaced on an existing record (not our own normalizer's rename,
            // which sets width/height to 1400 in the same payload.update call).
            const isFileReplacement =
              !isPostCreateUpdate &&
              !!previousDoc?.filename &&
              doc.filename !== previousDoc.filename &&
              !(doc.width === 1400 && doc.height === 1400)

            if (!isPostCreateUpdate && !isFileReplacement) return
            if (isPostCreateUpdate) pendingNormalize.delete(docIdStr)

            const { filename, id, processingMode } = doc
            const { payload } = req
            after(async () => {
              try {
                await normalizeMediaAfterUpload(filename, id, payload, processingMode ?? 'standard')
              } catch (err) {
                console.error('[image-normalize] Failed:', err)
              }
            })
          },
        ],
      },
      fields: [
        {
          name: 'normalizingIndicator',
          type: 'ui',
          admin: { disableListColumn: true, components: { Field: '@/components/payload/NormalizingIndicator#NormalizingIndicator' } },
        },
        { name: 'filesize', type: 'number', admin: { readOnly: true, components: { Cell: '@/components/payload/FileSizeCell#FileSizeCell' } } },
        { name: 'url', type: 'text', admin: { readOnly: true, components: { Cell: '@/components/payload/UrlCell#UrlCell' } } },
        { name: 'alt', label: 'Image Description', type: 'text', admin: { description: 'Describe the image briefly. E.g. "White 250ml plastic cup".' } },
        {
          name: 'normalizeImage',
          type: 'checkbox',
          label: 'Normalized',
          defaultValue: true,
          admin: { description: 'Removes background and centres on a white 1400x1400 canvas. Runs after upload, allow up to 30 seconds.' },
        },
        {
          name: 'processingMode',
          type: 'radio',
          label: 'Processing Mode',
          defaultValue: 'standard',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Gentle', value: 'gentle' },
          ],
          admin: {
            description: 'Use Gentle for white or transparent products to avoid clipping edges.',
            condition: (data) => !!data.normalizeImage,
          },
        },
      ],
    },
    {
      slug: 'colors',
      admin: { useAsTitle: 'nameEn' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'nameEn', label: 'Name (English)', type: 'text', required: true },
            { name: 'nameAr', label: 'Name (Arabic)', type: 'text' },
          ],
        },
      ],
    },
    {
      slug: 'materials',
      admin: { useAsTitle: 'name' },
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
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
          label: 'Support Lid Pairing',
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
                    {
                      name: 'showInLidGallery',
                      type: 'checkbox',
                      label: 'Show on lid page',
                      defaultValue: true,
                      admin: {
                        description: 'Include this image in the pairing gallery shown on the lid\'s product page.',
                        condition: (data, siblingData) => !!data.hasCompatibleLids && !!(siblingData as Record<string, unknown>)?.pairedLid,
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
                      type: 'relationship',
                      relationTo: 'materials',
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
                      fields: [
                        { name: 'width', type: 'number', label: 'Width (mm)', admin: { condition: (data) => data.shapeType === 'rectangular' } },
                        { name: 'length', type: 'number', label: 'Length (mm)', admin: { condition: (data) => data.shapeType === 'rectangular' } },
                      ],
                    },
                    {
                      name: 'height',
                      type: 'number',
                      label: 'Height (mm)',
                      admin: { condition: (data) => data.shapeType === 'circular' || data.shapeType === 'rectangular' },
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
                  type: 'relationship',
                  relationTo: 'colors',
                  hasMany: true,
                  label: 'Colors',
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
