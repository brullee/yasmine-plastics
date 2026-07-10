import { test, expect } from './fixtures'

// Real Resend delivery and Upstash rate limiting are third-party side effects with
// no place in an automated suite (every run would email the real business inbox and
// burn the 3-requests/10-min form limiter) - the network call to /api/contact is
// intercepted and asserted on directly instead of hitting the real API route.
// Turnstile itself is real (via Cloudflare's documented "always passes" test keys,
// see playwright.config.ts), so the whole client-side gating flow is exercised for real.
test('contact form fills, verifies, and submits successfully', async ({ page }) => {
  let requestBody: Record<string, unknown> | null = null

  await page.route('**/api/contact', async (route) => {
    requestBody = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })

  await page.goto('/en/contact')

  await page.locator('#contact-fullName').fill('Jamie Rivera')
  await page.locator('#contact-email').fill('jamie.rivera@example.com')
  await page.locator('#contact-message').fill('Interested in bulk pricing for 500ml containers.')

  const submit = page.getByRole('button', { name: 'Send Message' })
  await expect(submit).toBeEnabled({ timeout: 20_000 })
  await submit.click()

  await expect(page.getByText('Your message has been sent! Our team will contact you shortly.')).toBeVisible()

  expect(requestBody).not.toBeNull()
  expect(requestBody!.fullName).toBe('Jamie Rivera')
  expect(requestBody!.email).toBe('jamie.rivera@example.com')
  expect(requestBody!.message).toBe('Interested in bulk pricing for 500ml containers.')
  expect(requestBody!.honeypot).toBe('')
  expect(typeof requestBody!._token).toBe('string')
  expect((requestBody!._token as string).length).toBeGreaterThan(0)
})

test('contact form blocks submission until required fields are valid', async ({ page }) => {
  await page.goto('/en/contact')

  const submit = page.getByRole('button', { name: 'Send Message' })
  await expect(submit).toBeDisabled()

  await page.locator('#contact-fullName').fill('Jamie Rivera')
  await expect(submit).toBeDisabled()

  await page.locator('#contact-email').fill('not-an-email')
  await page.locator('#contact-email').blur()
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
  await expect(submit).toBeDisabled()
})
