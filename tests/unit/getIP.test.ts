import { describe, expect, it } from 'vitest'
import { getIP } from '@/lib/ratelimit'

describe('getIP', () => {
  it('uses the first x-forwarded-for entry, which Vercel sets to the client', () => {
    expect(getIP(new Headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' }))).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip', () => {
    expect(getIP(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2')
  })

  it('returns "unknown" with no IP headers, so those requests share one bucket', () => {
    expect(getIP(new Headers())).toBe('unknown')
  })

  it('accepts a Request as well as bare headers', () => {
    const req = new Request('https://example.com', { headers: { 'x-forwarded-for': '203.0.113.7' } })
    expect(getIP(req)).toBe('203.0.113.7')
  })
})
