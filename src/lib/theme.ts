// Central home for the site's light/dark color roles — formerly documented
// as prose in PLAN.md's "Color Equivalency Map". Import a role instead of
// hand-writing a new `X dark:Y` pair; that's how the ~150 scattered pairs
// this file replaces first happened, and how the same "missing dark hover
// swap" gap ended up fixed four separate times in four different files.
//
// Not every color pairing in the codebase belongs here. Several spots are
// *deliberate exceptions* to the dominant pattern (documented inline at each
// usage site, e.g. QuickViewModal's product-photo-adjacent surfaces, About's
// hand-tuned card treatment, Products browse's darker content background) —
// those stay as local literal classes on purpose. Only promote a new pairing
// here once it's a genuinely repeated, non-contextual role.

export const text = {
  /** Headings, primary content. Never black/gray-900 for primary text. */
  heading: 'text-brand-navy dark:text-white',
  /** Flowing body copy. */
  body: 'text-gray-600 dark:text-gray-300',
  /** Counts, timestamps, other de-emphasized meta. */
  muted: 'text-gray-500 dark:text-gray-400',
  /** Inline mailto/tel/`<a>` links — pair with `hover:underline`. */
  link: 'text-brand-navy dark:text-blue-400',
  /** Decorative eyebrow/icon accents on a Tint-toned section. */
  accentOnTint: 'text-brand-navy dark:text-blue-300',
  /** Placeholder text in form inputs. */
  placeholder: 'placeholder-gray-400 dark:placeholder-gray-500',
  /** Form labels, breadcrumbs, info values — secondary but not flowing prose. */
  secondaryUi: 'text-gray-700 dark:text-gray-300',
  /** A 4th, quieter tier below Muted: price disclaimers, empty states, tertiary counts. */
  faint: 'text-gray-400 dark:text-gray-500',
  /** What a user types into a form input — neutral, not brand-colored. */
  formInput: 'text-gray-900 dark:text-white',
  error: 'text-red-500 dark:text-red-400',
} as const

export const bg = {
  /** The body default / Base section tone. */
  pageSurface: 'bg-white dark:bg-brand-navyDeep',
  /** Forms, buttons, generic UI chrome. */
  genericPanel: 'bg-white dark:bg-gray-800',
  /** A panel that needs to visually separate from a white/Base-toned page. */
  distinctPanel: 'bg-gray-100 dark:bg-gray-800',
  /** Deliberate exception, not drift: surfaces hosting a product photo (always shot on white) need a lighter navy-slate, not a generic dark panel. */
  productSurface: 'bg-white dark:bg-slate-800',
  sectionTint: 'bg-brand-navy/10 dark:bg-brand-navy/20',
  sectionDeep: 'bg-gradient-to-br from-brand-navy to-brand-navyDark',
} as const

export const border = {
  /** Interactive element idle (chips, cards) — `/75` is the lightest usable floor on white, don't lighten further. */
  interactiveIdle: 'border-gray-500/75 dark:border-gray-500',
  /** Static divider on page content. */
  divider: 'border-gray-200 dark:border-gray-700',
  /** `divide-y` section dividers on a long-form Base-toned page. */
  sectionDivide: 'divide-gray-200 dark:divide-white/10',
  formIdle: 'border-gray-300 dark:border-gray-600',
  formError: 'border-red-400 dark:border-red-500',
} as const

export const button = {
  /** Primary CTA on a neutral page surface. */
  primary: 'bg-brand-navy text-white hover:bg-brand-navyHover dark:bg-brand-navyDark dark:hover:bg-brand-navy transition-colors',
  /** Primary CTA on a Deep (always-dark) section backdrop — same in both modes. */
  primaryOnDeep: 'bg-white text-brand-navy hover:bg-gray-300 transition-colors',
  /** Ghost/outline CTA on a Deep backdrop, paired beside primaryOnDeep — darkens on hover like its sibling instead of lightening. */
  ghostOnDeep: 'border-2 border-white text-white hover:bg-black/10 transition-colors',
  /** Secondary action next to a solid Primary (e.g. "Chat Now" beside "Send Inquiry"). Reuses the sky accent rather than introducing a new color. */
  secondaryCta: 'bg-sky-100 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-[#cdecfe] hover:border-sky-300 dark:hover:bg-sky-900/60 transition-colors',
} as const

export const chrome = {
  /** Header/Footer persistent border — a translucent white line reads better than flat gray on the always-dark brand-navyDeep chrome. */
  divider: 'border-gray-200 dark:border-white/10',
  /** Header's primary nav link, idle → hover. */
  navLink: 'text-gray-700 hover:text-brand-navy dark:text-gray-300 dark:hover:text-white',
  /** Footer nav link — intentionally quieter than header nav (Muted/meta pair, not Nav link). */
  footerLink: 'text-gray-500 hover:text-brand-navy dark:text-gray-400 dark:hover:text-white',
  /** Icon-only utility button (theme/language/menu toggle). Reuse this, don't write a one-off. */
  subtleBtn: 'text-gray-400 hover:text-brand-navy dark:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-brand-navyDark transition-colors',
  /** Quiet meta pill (e.g. "Last updated: ..."). */
  quietPill: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400',
} as const
