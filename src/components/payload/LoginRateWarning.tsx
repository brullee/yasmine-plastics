import { headers } from 'next/headers'
import { loginRateLimit } from '@/lib/ratelimit'
import { LoginRateWarningClient } from './LoginRateWarningClient'

export async function LoginRateWarning() {
  const headerStore = await headers()
  const ip =
    headerStore.get('x-forwarded-for')?.split(',')[0].trim() ??
    headerStore.get('x-real-ip') ??
    'unknown'

  const { remaining, reset } = await loginRateLimit.getRemaining(ip)

  return <LoginRateWarningClient initialRemaining={remaining} initialReset={reset} />
}
