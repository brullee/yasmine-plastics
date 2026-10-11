import { test, expect } from './fixtures'

// The admin login page only renders for a logged-out visitor, so an everyday logged-in
// session never sees it - a crash here (e.g. the beforeLogin rate-limit warning throwing
// on Sep 13) can sit unnoticed for weeks. Only checks that the form renders; never
// submits it, so no login attempt or rate-limit budget is ever spent.
test('admin login page renders the login form', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.locator('form.login__form')).toBeVisible()
  await expect(page.locator('input[name="password"]')).toBeVisible()
})
