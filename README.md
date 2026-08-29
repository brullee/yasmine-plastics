<div align="center">

<a href="https://yasmineplastics.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/YasmineLogoDark.svg">
    <img alt="Yasmine Plastics" src="public/YasmineLogo.svg" height="80" style="margin-bottom: 16px" />
  </picture>
</a>

A bilingual (AR/EN) B2B product catalog and quote request site for a plastics manufacturer based in Jordan.

</div>

> **Note:** This is the production codebase for [yasmineplastics.com](https://yasmineplastics.com), a real business. The code is public for portfolio review only. Reproducing, impersonating, or operating a copy of this site or its brand in any form is strictly prohibited. Legal action will be pursued if necessary.

---

## Overview

A website for my family's plastics manufacturing business. Buyers browse products, check specs, and submit quote requests in Arabic or English, while the business manages products, images, and content through an admin panel without touching code.

## Features

- **Bilingual (AR/EN)** - Arabic default with no URL prefix, English at `/en`, full RTL/LTR layout switching
- **Product catalog** - category browsing, quick view modal, image gallery with color/size-linked jumps, paired container/lid options
- **Image lightbox** - pinch/double-tap/scroll zoom, touch pan, swipe and keyboard navigation
- **Contact & quote forms** - Resend email, Cloudflare Turnstile, server-side validation
- **Admin & image pipeline** - Payload CMS admin, automatic background removal/EXIF/WebP/R2 upload on file upload, bulk upload with parallel compression
- **Two-factor auth** - hand-built TOTP, encrypted secret, hashed recovery codes, replay-proof
- **Security** - rate limiting, CSP, escaped output, tracked CVEs
- **Accessibility** - focus traps, translated ARIA labels, WCAG AA contrast, reduced-motion fallbacks
- **SEO** - meta/OG/hreflang, JSON-LD product schema, sitemap/robots
- **E2E tests** - Playwright covers the contact form, quote form, product pages, and language switch

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS (+ Sass, required by Payload admin UI) |
| CMS / Admin | Payload CMS v3 |
| Database | Neon (PostgreSQL via Drizzle) |
| Image storage | Cloudflare R2 |
| Image processing | Sharp + BRIA RMBG 2.0 on Modal |
| Email | Resend |
| Bot protection | Cloudflare Turnstile |
| Rate limiting | Upstash Redis |
| Error monitoring | Sentry |
| Two-factor auth | otpauth (TOTP) |
| i18n | next-intl (AR default, EN secondary) |
| Testing | Playwright |
| DNS / CDN | Cloudflare |
| Hosting | Vercel |
| Analytics | Vercel Analytics + Speed Insights |

## Technical Notes

- Product images run through an automatic pipeline: background removal, EXIF correction, centering, WebP conversion, direct-to-R2 upload
- Static generation is kept on pages that read query params (usually forces client-side rendering) via a shaped `<Suspense>` skeleton instead
- Recurring color/style combinations live in `src/lib/theme.ts`, not scattered inline classes
- GitHub Actions runs type-check and lint on every push and pull request
- Core Web Vitals audited with Lighthouse against a production build, not `next dev`
