const NAVY = '#005496'
const NAVY_DARK = '#003d6e'
const BG = '#f9fafb'

function row(label: string, value: string | null | undefined, link?: string) {
  if (!value || value === '-') return ''
  const cell = link
    ? `<a href="${link}" style="color:${NAVY};text-decoration:none;">${value}</a>`
    : value
  return `
    <tr>
      <td style="padding:12px 16px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;width:130px;">${label}</td>
      <td style="padding:12px 16px;font-size:14px;color:#111827;vertical-align:top;line-height:1.5;">${cell}</td>
    </tr>`
}

function divider() {
  return `<tr><td colspan="2" style="padding:0 16px;"><hr style="border:none;border-top:1px solid #d1d5db;margin:2px 0;"></td></tr>`
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

        <!-- Header -->
        <tr><td style="background:${NAVY_DARK};padding:28px 32px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1px;">Yasmine Plastics</p>
          <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:700;">New Contact Message</h1>
        </td></tr>

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
          <p style="margin:0;font-size:14px;color:#111827;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#ffffff;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Hit <strong>Reply</strong> to respond directly to ${fullName}.</p>
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

        <!-- Header -->
        <tr><td style="background:${NAVY_DARK};padding:28px 32px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1px;">Yasmine Plastics</p>
          <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:700;">Reset Your Password</h1>
        </td></tr>

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
          <p style="margin:0;font-size:12px;color:#9ca3af;">
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

        <!-- Header -->
        <tr><td style="background:${NAVY_DARK};padding:28px 32px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1px;">Yasmine Plastics</p>
          <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff;font-weight:700;">New Quote Request</h1>
        </td></tr>

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
              <p style="margin:0;font-size:14px;color:#111827;line-height:1.7;white-space:pre-wrap;">${details.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </td></tr>` : ''}
          </table>
        </td></tr>` : ''}

        <!-- Footer -->
        <tr><td style="background:#ffffff;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Hit <strong>Reply</strong> to respond directly to ${fullName}.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
