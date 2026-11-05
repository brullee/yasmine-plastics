import { after } from 'next/server'
import type { CollectionConfig } from 'payload'
import { normalizeMediaAfterUpload } from '@/lib/image-normalize'

export const Media: CollectionConfig = {
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
        // Replacement only; our own normalizer update never changes filename.
        const isFileReplacement =
          operation === 'update' &&
          !!previousDoc?.filename &&
          doc.filename !== previousDoc.filename

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
}
