// Central home for the site's semantic color roles. Import a role instead of
// hand-writing a new color class inline — that's how the same value ends up
// drifting across files. (This file used to hold light/dark pairs for a
// next-themes dark mode; that was removed, so every role below is just a
// single class string now.)
//
// Not every color choice in the codebase belongs here. Several spots are
// deliberate exceptions to the dominant pattern (documented inline at each
// usage site) and stay as local literal classes on purpose. Only promote a
// new pairing here once it's a genuinely repeated, non-contextual role.

export const text = {
  /** Headings, primary content. Never black/gray-900 for primary text. */
  heading: 'text-brand-navy',
  /** Flowing body copy. */
  body: 'text-gray-600',
  /** Counts, timestamps, other de-emphasized meta. */
  muted: 'text-gray-500',
  /** Inline mailto/tel/`<a>` links — pair with `hover:underline`. */
  link: 'text-brand-navy',
  /** Decorative eyebrow/icon accents on a Tint-toned section. */
  accentOnTint: 'text-brand-navy',
  /** Placeholder text in form inputs. */
  placeholder: 'placeholder-gray-400',
  /** Form labels, breadcrumbs, info values — secondary but not flowing prose. */
  secondaryUi: 'text-gray-700',
  /** A 4th, quieter tier below Muted: price disclaimers, empty states, tertiary counts. */
  faint: 'text-gray-400',
  /** What a user types into a form input — neutral, not brand-colored. */
  formInput: 'text-gray-900',
  error: 'text-red-500',
} as const

export const bg = {
  /** The body default / Base section tone. */
  pageSurface: 'bg-white',
  /** Forms, buttons, generic UI chrome. */
  genericPanel: 'bg-white',
  /** A panel that needs to visually separate from a white/Base-toned page. */
  distinctPanel: 'bg-gray-100',
  sectionTint: 'bg-brand-navy/10',
  sectionDeep: 'bg-gradient-to-br from-brand-navy to-brand-navyDark',
} as const

export const border = {
  /** Interactive element idle (chips, cards) — `/75` is the lightest usable floor on white, don't lighten further. */
  interactiveIdle: 'border-gray-500/75',
  /** Static divider on page content. */
  divider: 'border-gray-200',
  /** `divide-y` section dividers on a long-form Base-toned page. */
  sectionDivide: 'divide-gray-200',
  formIdle: 'border-gray-300',
  formError: 'border-red-400',
} as const

export const button = {
  /** Primary CTA on a neutral page surface. */
  primary: 'bg-brand-navy text-white hover:bg-brand-navyHover transition-colors',
  /** Primary CTA on a Deep (always-dark) section backdrop. */
  primaryOnDeep: 'bg-white text-brand-navy hover:bg-gray-300 transition-colors',
  /** Ghost/outline CTA on a Deep backdrop, paired beside primaryOnDeep — darkens on hover like its sibling instead of lightening. */
  ghostOnDeep: 'border-2 border-white text-white hover:bg-black/10 transition-colors',
  /** Secondary action next to a solid Primary (e.g. "Chat Now" beside "Send Inquiry"). Reuses the sky accent rather than introducing a new color. */
  secondaryCta: 'bg-sky-100 border border-sky-200 text-sky-700 hover:bg-[#cdecfe] hover:border-sky-300 transition-colors',
} as const

export const chrome = {
  /** Header/Footer persistent border. */
  divider: 'border-gray-200',
  /** Header's primary nav link, idle → hover. */
  navLink: 'text-gray-700 hover:text-brand-navy',
  /** Footer nav link — intentionally quieter than header nav (Muted/meta pair, not Nav link). */
  footerLink: 'text-gray-500 hover:text-brand-navy',
  /** Icon-only utility button (language/menu toggle). Reuse this, don't write a one-off. */
  subtleBtn: 'text-gray-400 hover:text-brand-navy hover:bg-gray-100 transition-colors',
  /** Quiet meta pill (e.g. "Last updated: ..."). */
  quietPill: 'bg-gray-100 text-gray-500',
} as const
