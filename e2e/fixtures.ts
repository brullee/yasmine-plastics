import { test as base, chromium } from '@playwright/test'

// A fresh browser per test: a shared one used to crash after a few contexts in a row.
export const test = base.extend({
  // Named `provide`, not Playwright's usual `use` - a param literally named `use`
  // trips the `react-hooks/rules-of-hooks` lint rule, which treats any function
  // named `use(...)` as a React hook call regardless of where it comes from.
  context: async ({}, provide) => {
    const browser = await chromium.launch({ args: ['--disable-gpu'] })
    const context = await browser.newContext()
    await provide(context)
    await context.close()
    await browser.close()
  },
})

export { expect } from '@playwright/test'
