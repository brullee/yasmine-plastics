import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { resendAdapter } from '@payloadcms/email-resend'
import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Colors } from '@/collections/Colors'
import { Materials } from '@/collections/Materials'
import { Sizes } from '@/collections/Sizes'
import { Units } from '@/collections/Units'
import { Categories } from '@/collections/Categories'
import { Products } from '@/collections/Products'

// Payload only awaits `initializing` in transactions, so a failed connect would be an unhandled rejection.
function handleInitRejection(db: ReturnType<typeof postgresAdapter>): ReturnType<typeof postgresAdapter> {
  return {
    ...db,
    init: (args) => {
      const adapter = db.init(args)
      adapter.initializing.catch(() => {})
      return adapter
    },
  }
}

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
          // Encode so a '#' in a filename doesn't truncate the URL.
          generateFileURL: ({ filename }) =>
            `${process.env.R2_PUBLIC_URL ?? ''}/${encodeURIComponent(filename)}`,
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
  collections: [Users, Media, Colors, Materials, Sizes, Units, Categories, Products],
  db: handleInitRejection(postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      allowExitOnIdle: true,
      // Close idle connections before Neon does, avoiding "Connection terminated unexpectedly".
      idleTimeoutMillis: 30000,
    },
  })),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },
})
