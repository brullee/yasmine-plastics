export function MOQWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600/70 rounded-lg px-4 py-3">
      <svg className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{children}</p>
    </div>
  )
}
