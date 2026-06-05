'use client'

import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
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
