<div align="center">

<a href="https://yasmineplastics.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/YasmineLogoDark.svg">
    <img alt="Yasmine Plastics" src="public/YasmineLogo.svg" height="80" style="margin-bottom: 16px" />
  </picture>
</a>

# Yasmine Plastics

A bilingual (AR/EN) B2B product catalog and quote request site for a plastics manufacturer based in Jordan.

**Live site ➜ [yasmineplastics.com](https://yasmineplastics.com)**

</div>

> **Note:** This is the production codebase for [yasmineplastics.com](https://yasmineplastics.com), a real business. The code is public for portfolio review only. Reproducing, impersonating, or operating a copy of this site or its brand in any form is strictly prohibited. Legal action will be pursued if necessary.

---

## Overview

A website for my family's plastics manufacturing business. Buyers can browse products, check specs, and submit quote requests in Arabic or English. The business manages everything through an admin panel without touching code.

## What it does

The product catalog is browsable by category with a quick view modal and full product detail pages. Each product has an image gallery, color and size options, specs, and a quote request form. The admin panel at `admin.yasmineplastics.com` handles products, categories, colors, sizes, and media, including a bulk image upload flow with automatic normalization.

## Features

### Bilingual with Full RTL/LTR

Arabic is the default locale with no URL prefix (`/products`). English is at `/en/products`. Layout direction, font, and spacing switch automatically based on locale. Built with next-intl.

### Product Gallery with Color and Size Jumps

Each gallery image can be tagged with a color and size in the admin. Selecting a color or size option on the product page jumps the carousel to the associated image, and vice versa: clicking a gallery image highlights the matching options.

### Image Lightbox

Clicking any product image opens a fullscreen lightbox. Supports pinch-to-zoom, double-tap to toggle zoom, touch pan when zoomed in, scroll-wheel zoom with cursor-tracked origin, swipe to navigate between images, and keyboard arrow/escape navigation.

### Quick View Modal

Products can be previewed in an animated modal without leaving the catalog page. The modal includes a full image carousel, color/size selectors, and links to the associated lid or container.

### Image Normalization Pipeline

Uploading a product image through the admin panel triggers an automatic pipeline:

1. Image sent to a Modal container running BRIA RMBG 2.0
2. Background removed and subject isolated
3. EXIF orientation applied, subject centered and padded on a white 1400×1400 canvas
4. Converted to WebP and uploaded directly to Cloudflare R2 from the browser
5. Admin panel shows a live progress indicator during processing

Two modes are available: Standard (tighter crop, 65% canvas fill) and Gentle (55% fill, for products with fine edges the BG remover clips).

### Bulk Upload with Parallel Compression

The media library supports bulk image upload with client-side WebP compression. All files are compressed in parallel before upload, with a Payload-styled progress overlay and cancellation support.

### SEO

Every page has meta titles, descriptions, Open Graph tags, canonical URLs, and hreflang tags. Product pages include Product schema (JSON-LD). The site generates a `sitemap.xml` and `robots.txt`.

### Quote Request and Contact Forms

Both forms send to the business via Resend and are protected by Cloudflare Turnstile. Server-side validation is applied to all fields before sending.

### Static Product Pages

Product pages are statically rendered at build time and revalidated every hour (`revalidate = 3600`).

### Rate Limiting and Security

Form submissions are rate-limited to 3 per 10 minutes per IP via Upstash Redis. Admin login is limited to 5 attempts per 15 minutes, with a progressive warning rendered server-side on the login page as attempts are used up. All external service calls (Upstash, Turnstile, Resend) fail open except email, which returns a 500.

### Dark Mode

Full dark/light theme via next-themes, with the admin panel defaulting to dark mode.

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
| i18n | next-intl (AR default, EN secondary) |
| DNS / CDN | Cloudflare |
| Hosting | Vercel |
| Analytics | Vercel Analytics + Speed Insights |

## Technical Notes

- Payload generates the admin UI from collection schemas, no custom admin UI needed
- R2 client uploads bypass Vercel's 4.5MB request limit; files go browser ➜ R2 directly via a presigned URL
- R2 is served through `media.yasmineplastics.com` via Cloudflare's CDN; cache is purged after each normalization re-upload
- The admin subdomain (`admin.yasmineplastics.com`) is routed to `/admin` via a Cloudflare redirect rule, no separate deployment
- Material type is pre-selected in the admin form based on category (Cups/Containers/Lids ➜ PP, Buckets ➜ PS)
- Sizes can be created inline from the product form without navigating away
- Arabic locale has no URL prefix; `/ar/*` URLs redirect to `/*` via the next-intl middleware
