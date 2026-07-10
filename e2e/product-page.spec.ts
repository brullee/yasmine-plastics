import { test, expect } from './fixtures'

// English locale (`/en` prefix) throughout so assertions can match the literal
// strings in src/messages/en.json instead of Arabic copy.
test('browsing from the category grid to a product detail page shows real content', async ({ page }) => {
  await page.goto('/en/products')
  await expect(page.getByRole('heading', { name: 'Our Products' })).toBeVisible()

  const categoryLinks = page.locator('a[href*="/en/products?category="]')
  const categoryCount = await categoryLinks.count()
  expect(categoryCount).toBeGreaterThan(0)

  const categoryHrefs: string[] = []
  for (let i = 0; i < categoryCount; i++) {
    const href = await categoryLinks.nth(i).getAttribute('href')
    if (href) categoryHrefs.push(href)
  }

  // Not every category is guaranteed to have products yet (real, evolving catalog
  // data) - try each until one actually renders product cards.
  const productLinkSelector = 'a[href^="/en/products/"]:not([href*="?"])'
  let foundProductHref: string | null = null

  for (const href of categoryHrefs) {
    await page.goto(href)
    const productLinks = page.locator(productLinkSelector)
    if (await productLinks.count() > 0) {
      foundProductHref = await productLinks.first().getAttribute('href')
      await productLinks.first().click()
      break
    }
  }

  expect(foundProductHref, 'expected at least one category to have real products to click into').not.toBeNull()

  await page.waitForURL(new RegExp(foundProductHref!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('h1')).not.toBeEmpty()
  await expect(page.getByRole('link', { name: 'Send Inquiry' })).toBeVisible()
})
