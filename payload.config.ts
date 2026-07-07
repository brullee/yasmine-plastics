import path from 'path'
import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { APIError, buildConfig } from 'payload'
import { normalizeMediaAfterUpload } from '@/lib/image-normalize'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { forgotPasswordEmailHtml } from '@/lib/emailTemplates'
import { loginRateLimit } from '@/lib/ratelimit'
import { verifyRecoveryCode, verifyTotpCode } from '@/lib/totp'


export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  upload: { limits: { fileSize: 10485760 } },
  i18n: {
    translations: {
      en: { general: { noLabel: '–' } },
      ar: { general: { noLabel: '–' } },
    },
  },
  email: resendAdapter({
    defaultFromName:    'Yasmine Co.',
    defaultFromAddress: 'noreply@yasmineplastics.com',
    apiKey: process.env.RESEND_API_KEY ?? '',
  }),
  admin: {
    user: 'users',
    theme: 'dark',
    avatar: {
      Component: '@/components/payload/AdminAvatar#AdminAvatar',
    },
    components: {
      providers: [
        '@/components/payload/ClientImageCompressor#ClientImageCompressorProvider',
      ],
      beforeLogin: [
        '@/components/payload/LoginRateWarning#LoginRateWarning',
      ],
      views: {
        login: {
          Component: '@/components/payload/LoginView#LoginView',
        },
      },
    },
  },
  plugins: [
    s3Storage({
      clientUploads: true,
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
        maxLoginAttempts: 0,
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
      hooks: {
        beforeLogin: [
          async ({ req, user }) => {
            const ip =
              req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
              req.headers.get('x-real-ip') ??
              'unknown'

            // Rate-limit only genuine failures (wrong/missing 2FA code below), not every
            // request — a successful login, and the expected first step of a 2FA login
            // (password correct, code not sent yet), aren't attacks and shouldn't burn
            // through the same budget as an actual bad guess.
            // Plain `Error` is treated as an unexpected server crash (500, logged with a full
            // stack trace) — these are expected, routine rejections (every 2FA login hits
            // "code required" once by design), so use Payload's own APIError with a real 4xx
            // status instead.
            const fail = async (message: string): Promise<never> => {
              const { success } = await loginRateLimit.limit(ip)
              if (!success) throw new APIError('Too many login attempts. Please try again later.', 429)
              throw new APIError(message, 401)
            }

            const u = user as Record<string, unknown>
            if (!u.twoFactorEnabled) return

            // Submitted by the custom login view (src/components/payload/LoginView.tsx)
            // alongside email/password — this hook runs after password verification
            // succeeds but before a token is issued, so this is the right place to gate
            // on it.
            const code = (req.data as Record<string, unknown> | undefined)?.twoFactorCode as string | undefined
            if (!code) throw new APIError('Two-factor code required', 401)

            const encryptedSecret = u.twoFactorSecret as string | undefined
            const lastUsedStep = (u.twoFactorLastUsedStep ?? null) as number | null
            const matchedStep = encryptedSecret ? verifyTotpCode(encryptedSecret, code, lastUsedStep) : null
            if (matchedStep !== null) {
              // Persist the step this code matched so the same code (or an earlier one,
              // within the validation window) can't be replayed — e.g. to immediately
              // disable 2FA right after using it to log in (see /api/2fa/disable).
              await req.payload.update({
                collection: 'users',
                id: u.id as string,
                data: { twoFactorLastUsedStep: matchedStep },
                overrideAccess: true,
              })
              return
            }

            const recoveryCodes = (u.twoFactorRecoveryCodes ?? []) as { hash: string; id?: string }[]
            const matchIndex = recoveryCodes.findIndex((r) => verifyRecoveryCode(code, r.hash))
            if (matchIndex === -1) await fail('Invalid two-factor code')

            // Consume the recovery code so it can't be reused.
            const remaining = recoveryCodes.filter((_, i) => i !== matchIndex)
            await req.payload.update({
              collection: 'users',
              id: u.id as string,
              data: { twoFactorRecoveryCodes: remaining },
              overrideAccess: true,
            })
          },
        ],
      },
      admin: { useAsTitle: 'email' },
      fields: [
        {
          name: 'twoFactorEnabled',
          type: 'checkbox',
          defaultValue: false,
          // Hidden — TwoFactorSetup (below) is the single status/toggle UI for this;
          // showing the raw checkbox too was a redundant second indicator of the same state.
          // `hidden` only affects the edit form — `disableListColumn` is the separate switch
          // for the collection's list-view table, which otherwise shows every field by default.
          admin: { readOnly: true, hidden: true, disableListColumn: true },
        },
        {
          name: 'twoFactorSecret',
          type: 'text',
          admin: { hidden: true, disableListColumn: true },
          access: { read: () => false },
        },
        {
          name: 'twoFactorRecoveryCodes',
          type: 'array',
          admin: { hidden: true, disableListColumn: true },
          access: { read: () => false },
          fields: [
            { name: 'hash', type: 'text' },
          ],
        },
        {
          name: 'twoFactorLastUsedStep',
          label: 'Two-Factor Last Used Step',
          type: 'number',
          // The TOTP time-step counter last accepted for this user (login or disable) —
          // replay protection, not a user-facing setting. See src/lib/totp.ts.
          admin: { hidden: true, disableListColumn: true },
          access: { read: () => false },
        },
        {
          name: 'twoFactorSetup',
          label: 'Two-Factor Authentication',
          type: 'ui',
          admin: {
            disableListColumn: true,
            components: {
              Field: '@/components/payload/TwoFactorSetup#TwoFactorSetup',
            },
          },
        },
      ],
    },
    {
      slug: 'media',
      upload: {
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
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

            const isCreate = operation === 'create'
            // File replaced on an existing record (not our own normalizer's update,
            // which sets width/height to 1400).
            const isFileReplacement =
              operation === 'update' &&
              !!previousDoc?.filename &&
              doc.filename !== previousDoc.filename &&
              !(doc.width === 1400 && doc.height === 1400)

            if (!isCreate && !isFileReplacement) return

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
          label: 'Canvas Fill',
          defaultValue: 'standard',
          options: [
            { label: 'Standard (65%)', value: 'standard' },
            { label: 'Spacious (55%)', value: 'gentle' },
            { label: 'Wide (35%)', value: 'wide' },
          ],
          admin: {
            disableListColumn: true,
            description: 'How much of the 1400x1400 canvas the product fills. Spacious adds breathing room; Wide leaves more canvas around the subject.',
            components: {
              Field: '@/components/payload/ProcessingModeField#ProcessingModeField',
            },
          },
        },
      ],
    },
    {
      slug: 'colors',
      admin: { useAsTitle: 'nameEn' },
      access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
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
      access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
      ],
    },
    {
      slug: 'sizes',
      admin: { useAsTitle: 'label' },
      access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
      fields: [
        { name: 'label', label: 'Size', type: 'text', required: true },
      ],
    },
    {
      slug: 'units',
      admin: { useAsTitle: 'label' },
      access: { read: () => true, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
      fields: [
        { name: 'label', label: 'Unit', type: 'text', required: true },
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
            if (data.capacityAutoGenerate !== false) {
              const sizeIds: unknown[] = data.sizes ?? []
              if (sizeIds.length) {
                const labels = await Promise.all(
                  sizeIds.map(async (id) => {
                    if (typeof id === 'object' && id !== null && 'label' in id) return (id as { label: string }).label
                    const s = await req.payload.findByID({ collection: 'sizes', id: id as string })
                    return (s as { label?: string }).label ?? ''
                  })
                )
                const nums = labels.map(l => parseFloat(l)).filter(n => !isNaN(n)).sort((a, b) => a - b)
                if (nums.length) {
                  let unitLabel = ''
                  if (data.sizeUnit) {
                    const unitId = typeof data.sizeUnit === 'object' && data.sizeUnit !== null ? (data.sizeUnit as { id: unknown }).id : data.sizeUnit
                    const u = await req.payload.findByID({ collection: 'units', id: unitId as string })
                    unitLabel = (u as { label?: string }).label ?? ''
                  }
                  const range = nums.length === 1 ? `${nums[0]}` : `${nums[0]}-${nums[nums.length - 1]}`
                  data.capacity = `${range}${unitLabel}`
                }
              }
            }
            return data
          },
        ],
        afterChange: [
          ({ doc }) => {
            if (doc.slug) {
              revalidatePath(`/products/${doc.slug}`)
              revalidatePath(`/en/products/${doc.slug}`)
            }
            revalidatePath('/products')
            revalidatePath('/en/products')
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
          name: 'categoryMaterialSync',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/payload/CategoryMaterialSync#CategoryMaterialSync',
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
                      name: 'capacityAutoGenerate',
                      type: 'checkbox',
                      label: 'Auto-generate capacity from sizes',
                      defaultValue: true,
                      admin: { description: 'Derives capacity from size options. Single size shows as-is; multiple sizes show as a range (e.g. 100-300ml). Uncheck to enter manually.' },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'capacity',
                          type: 'text',
                          admin: {
                            description: 'Include the unit. E.g. "250ml", "3L".',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            condition: (data: any) => data.capacityAutoGenerate === false,
                          },
                        },
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
                      defaultValue: 'circular',
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
                      defaultValue: false,
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
                  type: 'relationship',
                  relationTo: 'sizes',
                  hasMany: true,
                  label: 'Sizes',
                  admin: {
                    components: {
                      Field: '@/components/payload/SizesField#SizesField',
                    },
                  },
                },
                {
                  name: 'sizeUnit',
                  type: 'relationship',
                  relationTo: 'units',
                  label: 'Size Unit',
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  validate: (value: any, { siblingData }: { siblingData: any }) => {
                    const sizes = siblingData?.sizes
                    const hasSizes = Array.isArray(sizes) && sizes.length > 0
                    if (hasSizes && !value) return 'Unit of measurement is required when sizes are set'
                    if (!hasSizes && value) return 'A unit is selected but no sizes are added'
                    return true
                  },
                  admin: { hidden: true },
                },
              ],
            },
            {
              label: 'Media',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Main Image' },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'mainImageLinkedColors',
                      type: 'relationship',
                      relationTo: 'colors',
                      label: 'Color shown',
                      admin: {
                        components: {
                          Field: '@/components/payload/MainImageColorsField#MainImageColorsField',
                        },
                      },
                    },
                    {
                      name: 'mainImageLinkedSizes',
                      type: 'relationship',
                      relationTo: 'sizes',
                      label: 'Size shown',
                      admin: {
                        components: {
                          Field: '@/components/payload/MainImageSizesField#MainImageSizesField',
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'gallery',
                  type: 'array',
                  label: 'Gallery',
                  admin: {
                    components: {
                      RowLabel: '@/components/payload/GalleryRowLabel#GalleryRowLabel',
                    },
                  },
                  fields: [
                    { name: 'image', type: 'upload', relationTo: 'media', required: true },
                    {
                      name: 'pairedLid',
                      type: 'relationship',
                      relationTo: 'products',
                      label: 'Paired with lid',
                      admin: {
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
                        condition: (data, siblingData) => !!data.hasCompatibleLids && !!(siblingData as Record<string, unknown>)?.pairedLid,
                      },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'linkedColors',
                          type: 'relationship',
                          relationTo: 'colors',
                          label: 'Color shown',
                          admin: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            condition: (data: any) => (Array.isArray(data.colors) && data.colors.length > 0) || (Array.isArray(data.sizes) && data.sizes.length > 1),
                            components: {
                              Field: '@/components/payload/LinkedColorsField#LinkedColorsField',
                            },
                          },
                        },
                        {
                          name: 'linkedSizes',
                          type: 'relationship',
                          relationTo: 'sizes',
                          label: 'Size shown',
                          admin: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            condition: (data: any) => (Array.isArray(data.colors) && data.colors.length > 0) || (Array.isArray(data.sizes) && data.sizes.length > 1),
                            components: {
                              Field: '@/components/payload/LinkedSizesField#LinkedSizesField',
                            },
                          },
                        },
                      ],
                    },
                  ],
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
      allowExitOnIdle: true,
    },
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
})
