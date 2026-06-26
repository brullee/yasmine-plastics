import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withPayload } from '@payloadcms/next/withPayload'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/admin/en', destination: '/admin', permanent: false },
      { source: '/admin/en/:path*', destination: '/admin/:path*', permanent: false },
      { source: '/admin/ar', destination: '/admin', permanent: false },
      { source: '/admin/ar/:path*', destination: '/admin/:path*', permanent: false },
    ]
  },
}

export default withPayload(withNextIntl(nextConfig))
