export function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-green-100 border border-green-300 p-8 text-center">
      <p className="text-green-800 font-semibold text-lg">
        {children}
      </p>
    </div>
  )
}
