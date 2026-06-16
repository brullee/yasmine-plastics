import { NextResponse } from 'next/server'
import { sendMail, MAIL_TO, verifyTurnstile } from '@/lib/mailer'
import { quoteEmailHtml } from '@/lib/emailTemplates'

export async function POST(req: Request) {
  const { firstName, lastName, company, email, phone, product, productName, color, size, lid, lidName, delivery, details, honeypot, _token } = await req.json()

  if (honeypot) return NextResponse.json({ ok: true })

  if (!_token || !(await verifyTurnstile(_token)))
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim())
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

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
    delivery    ? `\nDelivery: ${delivery}` : null,
    details     ? `\nDetails:\n${details}` : null,
  ].filter(Boolean).join('\n')

  await sendMail({
    to: MAIL_TO,
    replyTo: email,
    subject: `Quote Request from ${name}`,
    html: quoteEmailHtml({ firstName, lastName, company, email, phone, productName, productSlug: product, color, size, lidName, lidSlug: lid, delivery, details }),
    text: textLines,
  })

  return NextResponse.json({ ok: true })
}
