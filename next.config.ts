import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withPayload } from '@payloadcms/next/withPayload'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.VERCEL_ENV !== 'production' ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''} https://challenges.cloudflare.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' media.yasmineplastics.com https://www.gravatar.com data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://o4511671399415808.ingest.de.sentry.io https://vitals.vercel-insights.com https://*.r2.cloudflarestorage.com",
      "frame-src https://maps.google.com https://www.google.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: csp },
          ...(process.env.VERCEL_ENV !== 'production'
            ? [{ key: 'X-Robots-Tag', value: 'noindex' }]
            : []),
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'yasmineplastics.com' }],
        destination: 'https://www.yasmineplastics.com/:path*',
        permanent: true,
      },
      { source: '/admin/en', destination: '/admin', permanent: false },
      { source: '/admin/en/:path*', destination: '/admin/:path*', permanent: false },
      { source: '/admin/ar', destination: '/admin', permanent: false },
      { source: '/admin/ar/:path*', destination: '/admin/:path*', permanent: false },
      { source: '/admin/products/:slug', destination: '/api/admin-redirect?collection=products&slug=:slug', permanent: false },
    ]
  },
}

export default withSentryConfig(withPayload(withNextIntl(nextConfig)), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "yasmine-co",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
