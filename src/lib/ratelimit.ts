import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// 5 requests per 10 minutes — contact / quote forms
export const formRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  prefix:  'rl:form',
})

// 10 attempts per 15 minutes — admin login brute-force protection
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

export function getIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
