import { headers } from 'next/headers'
import { getIP, loginRateLimit } from '@/lib/ratelimit'
import { LoginRateWarningClient } from './LoginRateWarningClient'

export async function LoginRateWarning() {
  const ip = getIP(await headers())

  try {
    const { remaining, reset } = await loginRateLimit.getRemaining(ip)
    return <LoginRateWarningClient initialRemaining={remaining} initialReset={reset} />
  } catch {
    return null
  }
}
