<div align="center">

<a href="https://yasmineplastics.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/YasmineLogoDark.svg">
    <img alt="Yasmine Plastics" src="public/YasmineLogo.svg" height="80" style="margin-bottom: 16px" />
  </picture>
</a>

# Yasmine Plastics

A bilingual (AR/EN) B2B product catalog and quote request site for a plastics manufacturer based in Jordan.

</div>

> **Note:** This is the production codebase for [yasmineplastics.com](https://yasmineplastics.com), a real business. The code is public for portfolio review only. Reproducing, impersonating, or operating a copy of this site or its brand in any form is strictly prohibited. Legal action will be pursued if necessary.

---

## Overview

A website for my family's plastics manufacturing business. Buyers can browse products, check specs, and submit quote requests in Arabic or English. The business manages everything through an admin panel without touching code.

## What it does

The product catalog is browsable by category with a quick view modal and full product detail pages. Each product has an image gallery, color and size options, specs, and a quote request form. Container products link to compatible lids and vice versa, with paired color/size selectors and a quick view without leaving the page. A dedicated homepage section highlights custom manufacturing capabilities and links to a pre-configured quote flow for custom orders. The admin panel at `admin.yasmineplastics.com` handles products, categories, colors, sizes, units, and media, including a bulk image upload flow with automatic normalization.

## Features

### Bilingual with Full RTL/LTR

Arabic is the default locale with no URL prefix (`/products`). English is at `/en/products`. Layout direction, font, and spacing switch automatically based on locale. Built with next-intl.

### Product Gallery with Color and Size Jumps

Each gallery image can be tagged with a color and size in the admin. Selecting a color or size option on the product page jumps the carousel to the associated image, and vice versa: clicking a gallery image highlights the matching options.

### Image Lightbox

Clicking any product image opens a fullscreen lightbox. Supports pinch-to-zoom, double-tap to toggle zoom, touch pan when zoomed in, scroll-wheel zoom with cursor-tracked origin, swipe to navigate between images, and keyboard arrow/escape navigation.

### Paired Product Options

Container product pages show a panel of compatible lids; lid pages show compatible containers. Selecting a paired product reveals its available colors and sizes alongside the main product's options. Both sets of options flow through to the WhatsApp inquiry message and the quote request form URL. A single MOQ notice appears if either product has a custom color selected.

### Quick View Modal

Products can be previewed in an animated modal without leaving the catalog page. The modal includes a full image carousel, color/size selectors, and links to the associated lid or container. On product detail pages, an eye icon on the paired product panel opens the same quick view modal in-context, so the user never has to navigate away to check the companion product.

### Image Normalization Pipeline

Uploading a product image through the admin panel triggers an automatic pipeline:

1. Image sent to a Modal container running BRIA RMBG 2.0
2. Background removed and subject isolated
3. EXIF orientation applied, subject centered and padded on a white 1400×1400 canvas
4. Converted to WebP and uploaded directly to Cloudflare R2 from the browser
5. Admin panel shows a live progress indicator during processing

Three canvas fill modes are available: Standard (65%, default), Spacious (55%, for products with fine edges the BG remover clips), and Wide (35%, for small or flat products like category images and finjans).

### Bulk Upload with Parallel Compression

The media library supports bulk image upload with client-side WebP compression. All files are compressed in parallel before upload, with a Payload-styled progress overlay and cancellation support.

### Capacity Auto-generation

Product capacity is derived automatically from the product's size options. When auto-generation is on (the default), the admin computes a range at save time: one size shows `100ml`, multiple sizes show `100-300ml`. Disabling it reveals a manual text field. Size units (ml, L, g, oz, etc.) are a separate database collection so the admin can add new units without code changes.

### Card Hover Animation

Product and category cards use a background-expand hover effect: a white (or dark) background layer scales outward and a deeper drop shadow fades in via opacity, while the card content scales up slightly. The shadow transition uses two layered divs so the browser composites the fade on the GPU rather than repainting the shadow every frame.

### SEO

Every page has meta titles, descriptions, Open Graph tags, canonical URLs, and hreflang tags. OG images are generated at build time: a default image (logo on white) applies to all pages; product pages override it with the product's main image on white. Product pages also include Product schema (JSON-LD). The site generates a `sitemap.xml` and `robots.txt`.

### Quote Request and Contact Forms

Both forms send to the business via Resend and are protected by Cloudflare Turnstile. Server-side validation is applied to all fields before sending.

### Static Product Pages

Product pages are statically rendered at build time and revalidated every hour (`revalidate = 3600`).

### Two-Factor Authentication (Admin)

Admin login supports optional TOTP two-factor authentication, hand-built with `otpauth` rather than a third-party plugin. The secret is stored encrypted (AES-256-GCM) and only ever decrypted server-side to check a code. Setup shows a QR code and a set of one-time recovery codes (stored as hashes, downloadable once). A used code cannot be replayed, whether that's a retry or an attempt to immediately disable 2FA right after using a code to log in.

### Security

Form submissions are rate-limited to 3 per 10 minutes per IP via Upstash Redis. Admin login is limited to 5 attempts per 15 minutes via a `beforeLogin` hook, with a progressive warning on the login page as attempts are used up. A Content Security Policy and other HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) are set globally. JSON-LD structured data is escaped against injection, and every user-submitted field is HTML-escaped before it reaches an outgoing email. All external service calls (Upstash, Turnstile, Resend) fail open except email, which returns a 500. Dependencies are tracked against known CVEs.

### Accessibility

Skip-to-content link, real keyboard focus traps for the quick view modal and image lightbox (initial focus on open, restored to the trigger on close), background content marked `inert` while a modal is open, and ARIA labels translated per locale instead of hardcoded in English. Form fields carry `aria-invalid`/`aria-describedby` on validation errors. Color contrast is checked against WCAG AA in both light and dark mode.

### Reduced Motion Support

A global `prefers-reduced-motion` rule collapses animation and transition durations across the site. Scroll reveal, card hover, quick view, and the product carousel each have a dedicated fallback rather than an instant snap: scroll reveal leaves content visible instead of animating it in and out, cards drop their scale/translate hover transforms but keep shadow and color feedback, quick view opens and closes instantly, and smooth-scroll calls fall back to instant scrolling.

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
| Error monitoring | Sentry |
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
- Size units (ml, L, g, oz, etc.) are a Payload collection; `sizeUnit` on products is a relationship, not a hardcoded select
- Capacity is auto-derived from size options via `deriveCapacity()` in `src/lib/utils.ts`; the DB field is written by a `beforeChange` hook
- GitHub Actions runs type-check and lint (`npm run check`) on every push to `main`/`dev` and on pull requests, separate from and faster than Vercel's own build-time checks
- Core Web Vitals audited with Lighthouse against a production build (not `next dev`); found and fixed a real LCP issue on product pages (`fetchPriority="high"` needed alongside `priority` on the main image), plus contrast and heading-order issues
