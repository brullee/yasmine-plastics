import { notFound } from 'next/navigation'

// Catches any path under [locale] that doesn't match a defined page (typos,
// stale links, bots probing paths) and routes it through the normal 404 flow
// (LocaleNotFound, sibling not-found.tsx) instead of falling through to the
// bare root not-found.tsx — keeps Header/Footer/theme/translations intact.
export default function CatchAll() {
  notFound()
}
