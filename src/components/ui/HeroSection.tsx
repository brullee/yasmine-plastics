import { cn } from '@/lib/utils'

interface HeroSectionProps {
  title: string
  subtitle?: string
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <div className="bg-brand-navy dark:bg-brand-navyDeep border-b border-brand-navyDark dark:border-gray-700 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className={cn('text-3xl md:text-4xl font-bold text-white', subtitle && 'mb-2')}>
          {title}
        </h1>
        {subtitle && <p className="text-white/60">{subtitle}</p>}
      </div>
    </div>
  )
}
