import { defineConfig, devices } from "@playwright/test";

// The E2E tests run on their own server, so a dev server already running on
// port 3000 (in whatever state, maybe from another session) cannot answer for
// them. They build the site into .e2e-dist/ and serve it with `vite preview`,
// which Vite's lock allows next to `vite dev` in the same folder; dist/ is
// left alone. Set E2E_PORT if 4174 is taken.
//
// The build uses development mode, in CI too, so the page keeps the
// GA-DEVELOPMENT-MODE id: a production build would load gtag.js and, once a
// test accepts cookies, send hits to the live Google Analytics property.
const port = Number(process.env.E2E_PORT) || 4174;
const baseURL = `http://localhost:${port}`;
const outDir = ".e2e-dist";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Take screenshot only on failure */
    screenshot: "only-on-failure",
    /* Force headless mode in CI */
    headless: !!process.env.CI,
    /* Increase timeout for WebKit stability and CI slowness */
    navigationTimeout: process.env.CI ? 120000 : 60000,
    actionTimeout: process.env.CI ? 60000 : 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // CI-friendly browser args
        launchOptions: process.env.CI
          ? {
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            }
          : undefined,
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        // CI-friendly browser args for mobile
        launchOptions: process.env.CI
          ? {
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            }
          : undefined,
      },
    },

    // WebKit is disabled by default due to compatibility issues
    // To enable WebKit testing, set ENABLE_WEBKIT=true environment variable
    ...(process.env.ENABLE_WEBKIT === "true"
      ? [
          {
            name: "webkit",
            use: {
              ...devices["Desktop Safari"],
              launchOptions: {
                slowMo: 1000,
              },
              navigationTimeout: 120000,
              actionTimeout: 60000,
              retries: 3,
            },
          },
        ]
      : []),
  ],

  /* Build the site and serve it on a port of its own */
  webServer: {
    command:
      `npx vite build --mode development --outDir ${outDir} --emptyOutDir --logLevel warn` +
      ` && npx vite preview --outDir ${outDir} --port ${port} --strictPort --no-open`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
