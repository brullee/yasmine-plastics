interface ValuePillProps {
  children: React.ReactNode
  dir?: string
}

export function ValuePill({ children, dir }: ValuePillProps) {
  return (
    <span
      dir={dir}
      className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
    >
      {children}
    </span>
  )
}
