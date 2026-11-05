import { revalidatePath } from 'next/cache'
import type { CollectionConfig } from 'payload'
import { LID_CATEGORY_SLUGS } from '@/lib/lidCategories'

export const Products: CollectionConfig = {
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
            // Lowercase because product lookups lowercase the URL.
            data.slug = `${prefix}-${data.artCode}`.toLowerCase()
            data.hasCompatibleLids = !!(cat as Record<string, unknown>).supportsCompatibleLids
          }
        }
        if (data.capacityAutoGenerate !== false) {
          const sizeIds: unknown[] = data.sizes ?? []
          if (sizeIds.length) {
            const alreadyPopulated = new Map<string, string>()
            const idsToFetch: string[] = []
            for (const id of sizeIds) {
              if (typeof id === 'object' && id !== null && 'label' in id) {
                const size = id as Record<string, unknown>
                alreadyPopulated.set(String(size.id), size.label as string)
              } else {
                idsToFetch.push(id as string)
              }
            }
            if (idsToFetch.length) {
              const { docs } = await req.payload.find({
                collection: 'sizes',
                where: { id: { in: idsToFetch } },
                limit: idsToFetch.length,
              })
              for (const doc of docs) alreadyPopulated.set(String(doc.id), doc.label ?? '')
            }
            const labels = sizeIds.map((id) => {
              const key = typeof id === 'object' && id !== null ? String((id as { id: unknown }).id) : String(id)
              return alreadyPopulated.get(key) ?? ''
            })
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
      async ({ doc, previousDoc, req }) => {
        if (doc.slug) {
          revalidatePath(`/products/${doc.slug}`)
          revalidatePath(`/en/products/${doc.slug}`)
        }
        revalidatePath('/products')
        revalidatePath('/en/products')

        // Lid pages show their paired containers, so revalidate lids added or removed too.
        const lidIds = new Set<number>()
        const collect = (document: Record<string, unknown> | undefined) => {
          if (!document) return
          for (const lid of (document.compatibleLidOptions as unknown[]) ?? []) {
            const id = typeof lid === 'object' && lid !== null ? (lid as { id?: number }).id : lid
            if (typeof id === 'number') lidIds.add(id)
          }
          for (const row of (document.gallery as Record<string, unknown>[]) ?? []) {
            const lid = row?.pairedLid
            const id = typeof lid === 'object' && lid !== null ? (lid as { id?: number }).id : lid
            if (typeof id === 'number') lidIds.add(id)
          }
        }
        collect(doc)
        collect(previousDoc)

        if (lidIds.size) {
          const { docs: lids } = await req.payload.find({
            collection: 'products',
            where: { id: { in: Array.from(lidIds) } },
            depth: 0,
            limit: lidIds.size,
          }).catch(() => ({ docs: [] }))
          for (const lid of lids) {
            if (!lid.slug) continue
            revalidatePath(`/products/${lid.slug}`)
            revalidatePath(`/en/products/${lid.slug}`)
          }
        }
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
                    {
                      name: 'artCode',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'Not the full code. Lowercase letters, digits and hyphens only, e.g. "116-200" or "116-h1".',
                        components: { Field: '@/components/payload/ArtCodeText#ArtCodeText' },
                      },
                      // Backstop for writes that skip ArtCodeText (API, scripts); this goes straight into the URL.
                      validate: (value: unknown, { required }: { required?: boolean }) => {
                        if (!value) return required ? 'Art code is required.' : true
                        if (typeof value !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) {
                          return 'Art code must be lowercase letters, digits and hyphens only, with no spaces (e.g. 116-200).'
                        }
                        return true
                      },
                    },
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
            {
              name: 'compatibleLidOptions',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              label: 'Compatible Lids',
              admin: {
                condition: (data) => !!data.hasCompatibleLids,
                description: 'Marks these lids as compatible without needing a paired photo. Add a gallery image with "Paired with lid" set instead/as well if you have a combined product photo for a given lid.',
                components: {
                  Field: '@/components/payload/PairedLidField#CompatibleLidsField',
                },
              },
              filterOptions: {
                or: LID_CATEGORY_SLUGS.map((slug) => ({ 'category.slug': { equals: slug } })),
              },
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
                    components: {
                      Field: '@/components/payload/PairedLidField#PairedLidField',
                    },
                  },
                  filterOptions: {
                    or: LID_CATEGORY_SLUGS.map((slug) => ({ 'category.slug': { equals: slug } })),
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
}
