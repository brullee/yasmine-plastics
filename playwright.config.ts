import { defineConfig, devices } from '@playwright/test'

const PORT = 3901
const BASE_URL = `http://localhost:${PORT}`

// Cloudflare's official "always passes" Turnstile test keys - safe to use in any
// environment, documented for exactly this purpose (automated testing). Passed as
// real process env vars to the spawned `next dev` below, which take precedence over
// whatever's in .env.local, so the real Turnstile site key/secret are never touched
// and no e2e run ever depends on reaching a human-solvable challenge.
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'
const TURNSTILE_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      // Browser launch itself (executablePath -> helium-browser, since this
      // environment has no bundled Playwright Chromium) happens in e2e/fixtures.ts,
      // not here - see its comment for why.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Isolated dist dir - never touches the `.next` a real `next dev`/`next build`
      // in this repo would use, so this can safely run alongside a live dev server.
      E2E_DIST_DIR: '.next-e2e',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITE_KEY,
      TURNSTILE_SECRET_KEY: TURNSTILE_TEST_SECRET_KEY,
    },
  },
})
