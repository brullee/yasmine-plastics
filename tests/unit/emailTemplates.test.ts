import { describe, expect, it } from 'vitest'
import { contactEmailHtml, newDeviceSignInEmailHtml, quoteEmailHtml } from '@/lib/emailTemplates'

const XSS = '<script>alert(1)</script>'
const ATTR_BREAK = '" onmouseover="alert(1)'

describe('email templates escape user input', () => {
  it('contact email', () => {
    const html = contactEmailHtml({ fullName: XSS, email: `a${ATTR_BREAK}@b.co`, phone: XSS, message: `<img src=x onerror=alert(1)>` })
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain(ATTR_BREAK)
    expect(html).toContain('&lt;script&gt;')
  })

  it('quote email', () => {
    const html = quoteEmailHtml({
      fullName: XSS, company: XSS, email: 'a@b.co', phone: ATTR_BREAK,
      productName: XSS, productSlug: XSS, color: XSS, size: XSS,
      lidName: XSS, lidSlug: XSS, lidColor: XSS, lidSize: XSS, delivery: XSS, details: XSS,
    })
    expect(html).not.toContain('<script>')
    expect(html).not.toContain(ATTR_BREAK)
  })

  it('new-device alert, whose IP and user agent come from request headers', () => {
    const html = newDeviceSignInEmailHtml({ userEmail: XSS, ip: XSS, userAgent: `${XSS}${ATTR_BREAK}`, time: XSS })
    expect(html).not.toContain('<script>')
    expect(html).not.toContain(ATTR_BREAK)
  })

  it('keeps contact links on their fixed schemes', () => {
    const html = contactEmailHtml({ fullName: 'A', email: 'javascript:alert(1)', phone: 'javascript:alert(1)', message: 'm' })
    expect(html).not.toMatch(/href="javascript:/)
    expect(html).toContain('href="mailto:javascript:alert(1)"')
    expect(html).toContain('href="tel:javascript:alert(1)"')
  })
})
