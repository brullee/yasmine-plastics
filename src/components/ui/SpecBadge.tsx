import { cn } from '@/lib/utils'

interface SpecBadgeProps {
  children: React.ReactNode
  compact?: boolean
  plain?: boolean
  dir?: string
}

export function SpecBadge({ children, compact, plain, dir }: SpecBadgeProps) {
  return (
    <span
      dir={dir}
      className={cn(
        'rounded',
        // dark:text-gray-400 kept on both variants on purpose: bumping the non-compact
        // one to gray-300 (its light gray-600 would otherwise suggest Body role) would
        // split it from the compact variant's dark value, and both render the same
        // spec content just in a different container.
        compact
          ? 'text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
          : 'text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-400',
        !plain && 'font-semibold uppercase tracking-wide',
      )}
    >
      {children}
    </span>
  )
}
