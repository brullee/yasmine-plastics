import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ loginLimit: vi.fn() }))

vi.mock('next-intl/middleware', () => ({
  default: () => () => new Response('i18n', { status: 200 }),
}))
vi.mock('@/lib/ratelimit', () => ({
  getIP: () => '203.0.113.7',
  loginRateLimit: { limit: mocks.loginLimit },
}))

const { default: proxy } = await import('@/proxy')

const req = (url: string, method = 'GET', host = 'www.yasmineplastics.com') =>
  new NextRequest(url, { method, headers: { host } })

beforeEach(() => {
  mocks.loginLimit.mockReset().mockResolvedValue({ success: true })
})

describe('forgot-password', () => {
  const url = 'https://www.yasmineplastics.com/api/users/forgot-password'

  it('is rate limited on POST', async () => {
    mocks.loginLimit.mockResolvedValue({ success: false })
    expect((await proxy(req(url, 'POST'))).status).toBe(429)
  })

  it('passes through when under the limit', async () => {
    const res = await proxy(req(url, 'POST'))
    expect(res.status).toBe(200)
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('fails open when Upstash is down, like every other rate limit', async () => {
    mocks.loginLimit.mockRejectedValue(new Error('upstash down'))
    const res = await proxy(req(url, 'POST'))
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('does not spend the limit on GET', async () => {
    await proxy(req(url))
    expect(mocks.loginLimit).not.toHaveBeenCalled()
  })
})

describe('login', () => {
  it('passes through without spending the limit, which beforeLogin applies to failures only', async () => {
    const res = await proxy(req('https://www.yasmineplastics.com/api/users/login', 'POST'))
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(mocks.loginLimit).not.toHaveBeenCalled()
  })
})

describe('admin subdomain', () => {
  it('sends product links to the fixed products lookup', async () => {
    const res = await proxy(req('https://admin.yasmineplastics.com/en/products/cup-1', 'GET', 'admin.yasmineplastics.com'))
    expect(res.headers.get('location')).toBe('https://www.yasmineplastics.com/api/admin-redirect?collection=products&slug=cup-1')
  })

  it('only ever redirects to the main site', async () => {
    const res = await proxy(req('https://admin.yasmineplastics.com//evil.example', 'GET', 'admin.yasmineplastics.com'))
    expect(new URL(res.headers.get('location')!).origin).toBe('https://www.yasmineplastics.com')
  })
})

describe('locale redirects', () => {
  it('strips the default /ar prefix with a 301 on the same origin', async () => {
    const res = await proxy(req('https://www.yasmineplastics.com/ar/products'))
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('https://www.yasmineplastics.com/products')
  })
})
