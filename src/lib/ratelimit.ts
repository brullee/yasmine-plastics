import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 3 requests per 10 minutes — contact / quote forms
export const formRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  prefix:  'rl:form',
})

// 5 attempts per 15 minutes — wrong/missing 2FA code and forgot-password guesses.
// Password guessing itself is throttled separately, by Payload's own account lockout
// (see maxLoginAttempts on the users collection in payload.config.ts).
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix:  'rl:login',
})

// 1 per 15 minutes, keyed by user id — caps the new-device sign-in alert email. Someone
// who already has a valid password but not the 2FA device can otherwise retrigger this
// email on every attempt (the "code required" step is deliberately not rate-limited like
// a real failure is, since it's the expected first step of every 2FA login).
export const newDeviceAlertRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '15 m'),
  prefix:  'rl:2fa-alert',
})

// Accepts either a Request or the Headers-like object next/headers() returns, so every
// call site (route handlers, the proxy, the beforeLogin hook, server components) can
// share this one implementation instead of re-deriving it.
export function getIP(reqOrHeaders: Request | { get(name: string): string | null }): string {
  // Check for .get rather than 'headers' in: Next's headers objects are proxies whose `in`
  // checks can't be trusted to tell them apart from a Request.
  const headers = 'get' in reqOrHeaders && typeof reqOrHeaders.get === 'function'
    ? reqOrHeaders
    : (reqOrHeaders as Request).headers
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
