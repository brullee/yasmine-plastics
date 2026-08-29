interface ValuePillProps {
  children: React.ReactNode
  dir?: string
}

export function ValuePill({ children, dir }: ValuePillProps) {
  return (
    <span
      dir={dir}
      className="text-xs font-semibold px-2.5 py-1 bg-white rounded-lg text-gray-700 border border-gray-200"
    >
      {children}
    </span>
  )
}
