import { test as base, chromium } from '@playwright/test'

// Launch a brand-new helium-browser process per test instead of reusing one shared
// worker-scoped browser instance. The shared instance was observed to crash (SIGSEGV,
// crashpad "tag not found") after handling a handful of contexts in a row - a fresh
// process per test avoids ever hitting whatever accumulates into that crash.
export const test = base.extend({
  // Named `provide`, not Playwright's usual `use` - a param literally named `use`
  // trips the `react-hooks/rules-of-hooks` lint rule, which treats any function
  // named `use(...)` as a React hook call regardless of where it comes from.
  context: async ({}, provide) => {
    const browser = await chromium.launch({
      // Locally this environment has no bundled Playwright Chromium, so point at the
      // system helium-browser. CI installs the real Playwright Chromium, so let
      // Playwright pick it by leaving executablePath unset.
      ...(process.env.CI ? {} : { executablePath: '/usr/bin/helium-browser' }),
      args: ['--disable-gpu'],
    })
    const context = await browser.newContext()
    await provide(context)
    await context.close()
    await browser.close()
  },
})

export { expect } from '@playwright/test'
