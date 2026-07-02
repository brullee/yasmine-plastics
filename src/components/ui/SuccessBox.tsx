export function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600/70 p-8 text-center">
      <p className="text-green-800 dark:text-green-300 font-semibold text-lg">
        {children}
      </p>
    </div>
  )
}
