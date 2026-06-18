'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'

// next-themes injects a <script> for pre-hydration theme detection, which triggers
// a React 19 dev-only warning on every soft-nav re-render. This is a known upstream
// incompatibility - no fix exists in next-themes stable. Suppress the specific
// message here so it doesn't pollute the console during development.
if (typeof window !== 'undefined') {
  const _origError = console.error
  console.error = (...args: Parameters<typeof console.error>) => {
    if (typeof args[0] === 'string' && args[0].startsWith('Encountered a script tag')) return
    _origError(...args)
  }
}

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
