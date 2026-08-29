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
        compact
          ? 'text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500'
          : 'text-xs px-2 py-1 bg-white border border-gray-200 text-gray-600',
        !plain && 'font-semibold uppercase tracking-wide',
      )}
    >
      {children}
    </span>
  )
}
