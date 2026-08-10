import Link from 'next/link'
import { cn } from '@/lib/utils'
import { bg, button } from '@/lib/theme'
import './globals.css'

// Root-level fallback: with [locale]/[...rest]/page.tsx catching every other
// unmatched path, the only thing that still lands here is a genuinely
// invalid locale segment (e.g. /fr/...) — not a real link a visitor would
// ever click. Like global-error.tsx, it stands in for the root layout, which
// is deliberately bare (see [locale]/layout.tsx), so it supplies its own
// <html>/<body> and can't rely on next-intl locale/dir/theme context being
// resolved. Uses the Deep gradient (theme.ts) since there's no next-themes
// provider here to toggle light/dark.
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className={cn('flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center', bg.sectionDeep)}>
          <img src="/YasmineLogoDark.svg" alt="Yasmine Plastics" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-white">Page not found</h1>
            <p className="mt-2 text-white/70">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
          </div>
          <Link
            href="/"
            className={cn('rounded-lg px-5 py-2.5 text-sm font-semibold', button.primaryOnDeep)}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  )
}
