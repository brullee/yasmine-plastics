<div align="center">

<a href="https://yasmineplastics.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/YasmineLogoDark.svg">
    <img alt="Yasmine Plastics" src="public/YasmineLogo.svg" height="80" style="margin-bottom: 16px" />
  </picture>
</a>

# Yasmine Plastics

A bilingual (EN/AR) B2B product catalog and quote request site for a plastics manufacturer based in Jordan.

**Live site → [yasmineplastics.com](https://yasmineplastics.com)**

</div>

> **Note:** This is the production codebase for [yasmineplastics.com](https://yasmineplastics.com), a real business. The code is public for portfolio review only. Reproducing, impersonating, or operating a copy of this site or its brand in any form is strictly prohibited. Legal action will be pursued if necessary.

---

## Overview

A website for my family's plastics manufacturing business. Buyers can browse products, check specs, and submit quote requests in Arabic or English. The business manages everything through an admin panel without touching code.

## What it does

The product catalog is browsable by category. Each product has a detail page with a gallery, specs, and a quote request form. The admin panel at `admin.yasmineplastics.com` handles products, categories, colors, sizes, and media.

Uploading a product image kicks off an automatic normalization pipeline: background removed via BRIA RMBG 2.0 on a serverless GPU container, subject centered and padded against white, converted to JPEG, then stored on Cloudflare R2.

## Features

### Bilingual with Full RTL/LTR

Arabic is the default locale with no URL prefix (`/products`). English is at `/en/products`. Layout direction, font, and spacing switch automatically based on locale. Built with next-intl.

### Image Normalization Pipeline

Uploading a product image through the admin panel triggers a serverless pipeline:

1. Image sent to a Modal container running BRIA RMBG 2.0
2. Background removed and subject isolated
3. Subject centered and padded against white
4. Converted to JPEG and uploaded to Cloudflare R2
5. Admin panel shows a live progress indicator during processing

Phone uploads are handled correctly: EXIF orientation is applied before processing so images aren't rotated, and JPEG/PNG files are converted to WebP client-side before upload (with a fallback for browsers that don't support it).

### Quote Request and Contact Forms

Both forms send directly to the business via Resend and are protected by Cloudflare Turnstile. Server-side validation is applied to all fields before sending.

### Static Product Pages

Product pages are statically rendered at build time and revalidated every hour (`revalidate = 3600`). On-demand revalidation from Payload hooks is not yet implemented.

### Rate Limiting

Form submissions are rate-limited to 3 per 10 minutes per IP. Admin login and forgot-password are limited to 5 attempts per 15 minutes, with a warning rendered server-side on the login page as attempts are used up.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| CMS / Admin | Payload CMS v3 |
| Database | Neon (PostgreSQL via Drizzle) |
| Image storage | Cloudflare R2 |
| Image processing | BRIA RMBG 2.0 on Modal |
| Email | Resend |
| Bot protection | Cloudflare Turnstile |
| Rate limiting | Upstash Redis |
| i18n | next-intl (EN + AR, RTL/LTR) |
| Hosting | Vercel |

## Technical Notes

- Payload generates the admin UI from collection schemas, no custom admin UI needed
- The normalization pipeline is a POST to a Modal endpoint that returns a processed image blob
- R2 is served through `media.yasmineplastics.com` via Cloudflare's CDN
- The admin subdomain (`admin.yasmineplastics.com`) is routed to `/admin` via a Cloudflare redirect rule, no separate deployment
- Material type is pre-selected in the admin form based on category (Cups/Containers/Lids use PP, Buckets use PS) to cut down on repetitive data entry
- Sizes can be created inline from the product form without navigating away
