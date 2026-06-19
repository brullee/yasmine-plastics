import { Resend } from 'resend'

export const MAIL_TO   = process.env.CONTACT_EMAIL ?? ''
export const MAIL_FROM = 'Yasmine Co. <forms@yasmineplastics.com>'

export async function sendMail({ to, replyTo, subject, html, text }: {
  to: string
  replyTo?: string
  subject: string
  html: string
  text: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({ from: MAIL_FROM, to, replyTo, subject, html, text })
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY ?? '', response: token }),
  })
  const data = await res.json() as { success: boolean }
  return data.success
}
