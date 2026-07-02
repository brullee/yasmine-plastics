'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChipButtonProps {
  active: boolean
  custom?: boolean
  onClick: () => void
  children: ReactNode
  type?: 'button' | 'submit'
}

export function ChipButton({ active, custom, onClick, children, type = 'button' }: ChipButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-all',
        active
          ? 'border-brand-navy bg-brand-navy/10 text-brand-navy dark:border-sky-400 dark:bg-sky-400/15 dark:text-sky-200'
          : custom
            ? 'bg-gray-100 border-dashed border-gray-400 text-gray-700 hover:border-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-300 dark:hover:text-gray-100'
            : 'bg-gray-100 border-gray-400 text-gray-700 hover:border-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:bg-transparent dark:border-gray-500 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
      )}
    >
      {children}
    </button>
  )
}

interface ChipRowProps {
  label: string
  value?: string
  valueDir?: 'ltr'
  children: ReactNode
}

export function ChipRow({ label, value, valueDir, children }: ChipRowProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</p>
        {value && <span className="text-sm text-gray-600 dark:text-gray-400" dir={valueDir}>{value}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
}
