import { NextResponse } from 'next/server'
import { sendMail, MAIL_TO, verifyTurnstile } from '@/lib/mailer'
import { contactEmailHtml } from '@/lib/emailTemplates'
import { formRateLimit, getIP } from '@/lib/ratelimit'

export async function POST(req: Request) {
  try {
    const { success } = await formRateLimit.limit(getIP(req))
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  } catch {}

  const { fullName, email, phone, message, honeypot, _token } = await req.json()

  if (honeypot) return NextResponse.json({ ok: true }) // silent drop

  if (!_token) return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  try {
    if (!await verifyTurnstile(_token))
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  } catch {}

  if (!fullName?.trim() || !email?.trim() || !message?.trim())
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  if (fullName.length > 100 || email.length > 254 || (phone && phone.length > 30) || message.length > 5000)
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })

  try {
    await sendMail({
      to: MAIL_TO,
      replyTo: email,
      subject: `Message from ${fullName}`,
      html: contactEmailHtml({ fullName, email, phone, message }),
      text: [`Name: ${fullName}`, `Email: ${email}`, phone ? `Phone: ${phone}` : null, ``, message].filter(Boolean).join('\n'),
    })
  } catch (err) {
    console.error('[contact] sendMail failed:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
