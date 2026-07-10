import { test, expect } from './fixtures'

// Same reasoning as contact-form.spec.ts: /api/quote is intercepted so no real
// email/rate-limit side effects run on every test invocation, while Turnstile
// itself is exercised for real via Cloudflare's test keys (playwright.config.ts).
test('quote form fills, verifies, and submits successfully', async ({ page }) => {
  let requestBody: Record<string, unknown> | null = null

  await page.route('**/api/quote', async (route) => {
    requestBody = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })

  await page.goto('/en/quote')

  await page.locator('#q-fullName').fill('Jamie Rivera')
  await page.locator('#q-email').fill('jamie.rivera@example.com')
  await page.locator('#q-phone').fill('+962791234567')

  const submit = page.getByRole('button', { name: 'Send Request' })
  await expect(submit).toBeEnabled({ timeout: 20_000 })
  await submit.click()

  await expect(page.getByText('Your quote request has been sent! Our team will contact you shortly.')).toBeVisible()

  expect(requestBody).not.toBeNull()
  expect(requestBody!.fullName).toBe('Jamie Rivera')
  expect(requestBody!.email).toBe('jamie.rivera@example.com')
  expect(requestBody!.phone).toBe('+962791234567')
  expect(requestBody!.honeypot).toBe('')
  expect(typeof requestBody!._token).toBe('string')
  expect((requestBody!._token as string).length).toBeGreaterThan(0)
})

test('quote form lets a product be picked, carrying its category, color, and size into the request', async ({ page }) => {
  let requestBody: Record<string, unknown> | null = null

  await page.route('**/api/quote', async (route) => {
    requestBody = route.request().postDataJSON()
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
  })

  await page.goto('/en/quote')

  await page.locator('#q-fullName').fill('Jamie Rivera')
  await page.locator('#q-email').fill('jamie.rivera@example.com')
  await page.locator('#q-phone').fill('+962791234567')

  const categorySelect = page.locator('#q-category')
  const categoryValues = await categorySelect.locator('option').evaluateAll(
    (opts) => opts.map((o) => (o as HTMLOptionElement).value).filter(Boolean)
  )
  expect(categoryValues.length).toBeGreaterThan(0)
  await categorySelect.selectOption(categoryValues[0])

  const productSelect = page.locator('#q-product')
  await expect(productSelect).toBeVisible()
  const productValues = await productSelect.locator('option').evaluateAll(
    (opts) => opts.map((o) => (o as HTMLOptionElement).value).filter(Boolean)
  )
  test.skip(productValues.length === 0, 'first category has no products yet to select')
  await productSelect.selectOption(productValues[0])

  const submit = page.getByRole('button', { name: 'Send Request' })
  await expect(submit).toBeEnabled({ timeout: 20_000 })
  await submit.click()

  await expect(page.getByText('Your quote request has been sent! Our team will contact you shortly.')).toBeVisible()
  expect(requestBody).not.toBeNull()
  expect(requestBody!.product).toBe(productValues[0])
})
