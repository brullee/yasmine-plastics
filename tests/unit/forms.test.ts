import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  formLimit: vi.fn(),
  verifyTurnstile: vi.fn(),
  sendMail: vi.fn(),
}))

vi.mock('@/lib/ratelimit', () => ({
  getIP: () => '203.0.113.7',
  formRateLimit: { limit: mocks.formLimit },
}))
vi.mock('@/lib/mailer', () => ({
  MAIL_TO: 'owner@test',
  sendMail: mocks.sendMail,
  verifyTurnstile: mocks.verifyTurnstile,
}))

const contact = await import('@/app/api/contact/route')
const quote = await import('@/app/api/quote/route')

const CONTACT = { fullName: 'Sara', email: 'sara@example.com', phone: '0790000000', message: 'Hello', _token: 'tok' }
const QUOTE = { fullName: 'Sara', email: 'sara@example.com', phone: '0790000000', productName: 'Cup', product: 'cup-1', _token: 'tok' }

const forms = [
  { name: 'contact', POST: contact.POST, valid: CONTACT, required: ['fullName', 'email', 'message'] },
  { name: 'quote', POST: quote.POST, valid: QUOTE, required: ['fullName', 'email', 'phone'] },
]

const post = (POST: (r: Request) => Promise<Response>, body: object) =>
  POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify(body) }))

beforeEach(() => {
  mocks.formLimit.mockReset().mockResolvedValue({ success: true })
  mocks.verifyTurnstile.mockReset().mockResolvedValue(true)
  mocks.sendMail.mockReset().mockResolvedValue({})
})

describe.each(forms)('$name form', ({ POST, valid, required }) => {
  it('sends a valid submission', async () => {
    const res = await post(POST, valid)
    expect(res.status).toBe(200)
    expect(mocks.verifyTurnstile).toHaveBeenCalledWith('tok')
    expect(mocks.sendMail).toHaveBeenCalledOnce()
    expect(mocks.sendMail.mock.calls[0][0]).toMatchObject({ to: 'owner@test', replyTo: 'sara@example.com' })
  })

  it('returns 429 when rate limited, without sending', async () => {
    mocks.formLimit.mockResolvedValue({ success: false })
    expect((await post(POST, valid)).status).toBe(429)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it('fails open when the rate limiter is down', async () => {
    mocks.formLimit.mockRejectedValue(new Error('upstash down'))
    expect((await post(POST, valid)).status).toBe(200)
    expect(mocks.sendMail).toHaveBeenCalledOnce()
  })

  it('silently drops honeypot submissions', async () => {
    const res = await post(POST, { ...valid, honeypot: 'bot' })
    expect(res.status).toBe(200)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it('rejects a missing Turnstile token', async () => {
    const { _token, ...rest } = valid
    void _token
    expect((await post(POST, rest)).status).toBe(400)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it('rejects a token Turnstile says is invalid', async () => {
    mocks.verifyTurnstile.mockResolvedValue(false)
    expect((await post(POST, valid)).status).toBe(400)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it('fails open when Turnstile is unreachable', async () => {
    mocks.verifyTurnstile.mockRejectedValue(new Error('network'))
    expect((await post(POST, valid)).status).toBe(200)
  })

  it.each(required)('requires %s', async (field) => {
    expect((await post(POST, { ...valid, [field]: '   ' })).status).toBe(400)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it.each(['plainaddress', 'a@b', 'a b@c.co', '@b.co'])('rejects the invalid email %s', async (email) => {
    expect((await post(POST, { ...valid, email })).status).toBe(400)
  })

  it('rejects over-long input', async () => {
    expect((await post(POST, { ...valid, fullName: 'x'.repeat(101) })).status).toBe(400)
    expect((await post(POST, { ...valid, phone: '1'.repeat(31) })).status).toBe(400)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it('rejects non-string fields instead of crashing', async () => {
    expect((await post(POST, { ...valid, fullName: 123 })).status).toBe(400)
    expect((await post(POST, { ...valid, details: { a: 1 } })).status).toBe(400)
    expect(mocks.sendMail).not.toHaveBeenCalled()
  })

  it('rejects a body that is not a JSON object', async () => {
    const raw = (body: string) => POST(new Request('https://example.com', { method: 'POST', body }))
    expect((await raw('not json')).status).toBe(400)
    expect((await raw('["a"]')).status).toBe(400)
    expect((await raw('null')).status).toBe(400)
  })

  it('returns 500 when the email fails to send', async () => {
    mocks.sendMail.mockRejectedValue(new Error('resend down'))
    expect((await post(POST, valid)).status).toBe(500)
  })
})

describe('form-specific limits', () => {
  it('caps the contact message at 5000 characters', async () => {
    expect((await post(contact.POST, { ...CONTACT, message: 'x'.repeat(5001) })).status).toBe(400)
  })

  it('caps quote details and company', async () => {
    expect((await post(quote.POST, { ...QUOTE, details: 'x'.repeat(5001) })).status).toBe(400)
    expect((await post(quote.POST, { ...QUOTE, company: 'x'.repeat(101) })).status).toBe(400)
  })
})
