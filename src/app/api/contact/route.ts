import { NextResponse } from 'next/server'
import { transporter, MAIL_TO, MAIL_FROM, verifyTurnstile } from '@/lib/mailer'
import { contactEmailHtml } from '@/lib/emailTemplates'

export async function POST(req: Request) {
  const { fullName, email, phone, message, honeypot, _token } = await req.json()

  if (honeypot) return NextResponse.json({ ok: true }) // silent drop

  if (!_token || !(await verifyTurnstile(_token)))
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })

  if (!fullName?.trim() || !email?.trim() || !message?.trim())
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  await transporter.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    replyTo: email,
    subject: `Message from ${fullName}`,
    html: contactEmailHtml({ fullName, email, phone, message }),
    text: [`Name: ${fullName}`, `Email: ${email}`, phone ? `Phone: ${phone}` : null, ``, message].filter(Boolean).join('\n'),
  })

  return NextResponse.json({ ok: true })
}
