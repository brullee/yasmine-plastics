import { NextResponse } from 'next/server'
import { sendMail, MAIL_TO, verifyTurnstile } from '@/lib/mailer'
import { quoteEmailHtml } from '@/lib/emailTemplates'
import { formRateLimit, getIP } from '@/lib/ratelimit'

export async function POST(req: Request) {
  try {
    const { success } = await formRateLimit.limit(getIP(req))
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  } catch {}

  const { firstName, lastName, company, email, phone, product, productName, color, size, lid, lidName, lidColor, lidSize, delivery, details, honeypot, _token } = await req.json()

  if (honeypot) return NextResponse.json({ ok: true })

  if (!_token) return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  try {
    if (!await verifyTurnstile(_token))
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  } catch {}

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim())
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  if (
    firstName.length > 50 || lastName.length > 50 || email.length > 254 ||
    phone.length > 30 || (company && company.length > 100) || (details && details.length > 5000)
  )
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })

  const name = `${firstName} ${lastName}`.trim()

  const textLines = [
    `Name: ${name}`,
    company     ? `Company: ${company}` : null,
    `Email: ${email}`,
    `Phone: ${phone}`,
    productName ? `\nProduct: ${productName} (${product})` : null,
    color       ? `Color: ${color}` : null,
    size && size !== '-' ? `Size: ${size}` : null,
    lidName     ? `Lid: ${lidName} (${lid})` : null,
    lidColor    ? `Paired Color: ${lidColor}` : null,
    lidSize && lidSize !== '-' ? `Paired Size: ${lidSize}` : null,
    delivery    ? `\nDelivery: ${delivery}` : null,
    details     ? `\nDetails:\n${details}` : null,
  ].filter(Boolean).join('\n')

  try {
    await sendMail({
      to: MAIL_TO,
      replyTo: email,
      subject: `Quote Request from ${name}`,
      html: quoteEmailHtml({ firstName, lastName, company, email, phone, productName, productSlug: product, color, size, lidName, lidSlug: lid, lidColor, lidSize, delivery, details }),
      text: textLines,
    })
  } catch (err) {
    console.error('[quote] sendMail failed:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
