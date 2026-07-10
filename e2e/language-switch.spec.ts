import { test, expect } from './fixtures'

// Arabic is the default, prefixless locale; English lives under `/en`.
const languageToggle = (page: import('@playwright/test').Page) => page.locator('header button:has-text("EN"), header button:has-text("AR")')

test('language toggle switches the homepage between Arabic (default) and English', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('header').getByRole('link', { name: 'المنتجات', exact: true })).toBeVisible()

  await languageToggle(page).click()
  await page.waitForURL(/\/en(\/)?$/)

  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await expect(page.locator('header').getByRole('link', { name: 'Products', exact: true })).toBeVisible()

  await languageToggle(page).click()
  await page.waitForURL(/^http:\/\/localhost:\d+\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
})

test('language toggle preserves the current path and category filter', async ({ page }) => {
  await page.goto('/en/products')
  const categoryLink = page.locator('a[href*="/en/products?category="]').first()
  const href = await categoryLink.getAttribute('href')
  expect(href).not.toBeNull()
  await categoryLink.click()
  await page.waitForURL(/\/en\/products\?category=/)

  const categorySlug = new URL(page.url()).searchParams.get('category')

  await languageToggle(page).click()
  await page.waitForURL(/^http:\/\/localhost:\d+\/products\?category=/)
  expect(page.url()).not.toContain('/en/')
  expect(new URL(page.url()).searchParams.get('category')).toBe(categorySlug)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
})
