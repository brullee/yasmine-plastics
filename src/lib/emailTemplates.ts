import { BASE_URL } from '@/lib/seo'

const NAVY = '#005496'
const NAVY_DARK = '#003d6e'
const BG = '#f9fafb'
export const LOGO_URL = `${BASE_URL}/logo-email.png`

function logoHeader(title: string) {
  return `
        <!-- Header -->
        <tr><td style="background:${NAVY_DARK};padding:24px 32px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;">
              <img src="${LOGO_URL}" width="52" height="52" alt="" style="display:block;border:0;">
            </td>
            <td style="vertical-align:middle;">
              <h1 style="margin:0;font-size:22px;color:#ffffff;font-weight:700;">${title}</h1>
            </td>
          </tr></table>
        </td></tr>`
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function row(label: string, value: string | null | undefined, link?: string) {
  if (!value || value === '-') return ''
  const safe = esc(value)
  const cell = link
    ? `<a href="${esc(link)}" style="color:${NAVY};text-decoration:none;">${safe}</a>`
    : safe
  return `
    <tr>
      <td style="padding:12px 16px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;width:130px;">${label}</td>
      <td style="padding:12px 16px;font-size:14px;color:#374151;vertical-align:top;line-height:1.5;">${cell}</td>
    </tr>`
}

function divider() {
  return `<tr><td colspan="2" style="padding:0 16px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:2px 0;"></td></tr>`
}

export function contactEmailHtml({ fullName, email, phone, message }: {
  fullName: string
  email: string
  phone?: string
  message: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

        ${logoHeader('New Contact Message')}

        <!-- Sender details -->
        <tr><td style="background:#ffffff;padding:8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', fullName)}
            ${row('Email', email, `mailto:${email}`)}
            ${phone ? row('Phone', phone, `tel:${phone}`) : ''}
          </table>
        </td></tr>

        <!-- Message -->
        <tr><td style="background:${BG};padding:24px 32px;">
          <p style="margin:0 0 10px;font-size:12px;color:${NAVY};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Message</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#ffffff;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#6b7280;">Hit <strong>Reply</strong> to respond directly to ${esc(fullName)}.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function forgotPasswordEmailHtml({ resetURL, userEmail }: {
  resetURL: string
  userEmail: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

        ${logoHeader('Reset Your Password')}

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;">
          <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
            We received a request to reset the password for <strong>${userEmail}</strong>.
            Click the button below to choose a new password.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="border-radius:6px;background:${NAVY};">
              <a href="${resetURL}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Reset Password</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#ffffff;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#6b7280;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetURL}" style="color:${NAVY};word-break:break-all;">${resetURL}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function newDeviceSignInEmailHtml({ userEmail, ip, userAgent, time }: {
  userEmail: string
  ip: string
  userAgent: string
  time: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

        ${logoHeader('New Sign-In Attempt')}

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px 32px 8px;">
          <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
            The correct password for <strong>${esc(userEmail)}</strong> was just used to sign in to the
            Yasmine Plastics admin panel from a device we haven't seen before. A two-factor code is
            being requested before access is granted.
          </p>
        </td></tr>

        <!-- Details -->
        <tr><td style="background:#ffffff;padding:8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('IP Address', ip)}
            ${row('Device', userAgent)}
            ${row('Time (UTC)', time)}
          </table>
        </td></tr>

        <!-- Guidance -->
        <tr><td style="background:${BG};padding:20px 32px;">
          <p style="margin:0 0 8px;font-size:13px;color:#374151;line-height:1.6;">
            If this was you, no action is needed. If you don't recognize this activity, change your
            password and make sure to keep two-factor authentication enabled.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function quoteEmailHtml({ fullName, company, email, phone, productName, productSlug, color, size, lidName, lidSlug, lidColor, lidSize, delivery, details }: {
  fullName: string
  company?: string
  email: string
  phone: string
  productName?: string
  productSlug?: string
  color?: string
  size?: string
  lidName?: string
  lidSlug?: string
  lidColor?: string
  lidSize?: string
  delivery?: string
  details?: string
}) {
  const displayColor = color === '__custom__' ? 'Custom' : color
  const hasProduct = productName || color || (size && size !== '-') || lidName
  const hasDetails = delivery || details

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">

        ${logoHeader('New Quote Request')}

        <!-- Contact details -->
        <tr><td style="background:#ffffff;padding:4px 0 8px;">
          <p style="margin:8px 16px 4px;font-size:12px;color:${NAVY};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Contact</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', fullName)}
            ${company ? row('Company', company) : ''}
            ${divider()}
            ${row('Email', email, `mailto:${email}`)}
            ${row('Phone', phone, `tel:${phone}`)}
          </table>
        </td></tr>

        ${hasProduct ? `
        <!-- Product details -->
        <tr><td style="background:${BG};padding:4px 0 8px;">
          <p style="margin:8px 16px 4px;font-size:12px;color:${NAVY};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Product</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
            ${productName && productSlug ? row('Product', `${productName} (${productSlug})`) : row('Product', productName)}
            ${row('Color', displayColor)}
            ${size && size !== '-' ? row('Size', size) : ''}
            ${lidName && lidSlug ? row('Lid', `${lidName} (${lidSlug})`) : row('Lid', lidName)}
            ${row('Paired Color', lidColor === '__custom__' ? 'Custom' : lidColor)}
            ${lidSize && lidSize !== '-' ? row('Paired Size', lidSize) : ''}
          </table>
        </td></tr>` : ''}

        ${hasDetails ? `
        <!-- Requirements -->
        <tr><td style="background:#ffffff;padding:4px 0 8px;">
          <p style="margin:8px 16px 4px;font-size:12px;color:${NAVY};text-transform:uppercase;letter-spacing:1px;font-weight:600;">Requirements</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Delivery', delivery)}
            ${details ? `<tr><td colspan="2" style="padding:10px 16px;">
              <p style="margin:0 0 6px;font-size:13px;color:${NAVY};font-weight:600;">Notes</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${details.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </td></tr>` : ''}
          </table>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr><td style="background:#ffffff;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#6b7280;">Hit <strong>Reply</strong> to respond directly to ${esc(fullName)}.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
