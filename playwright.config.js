import { defineConfig, devices } from "@playwright/test";

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
    baseURL: process.env.CI ? "http://localhost:4173" : "http://localhost:3000",
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

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    // Use different port in CI to avoid conflicts
    ...(process.env.CI && {
      command: "npm run dev -- --port 4173",
      url: "http://localhost:4173",
    }),
  },
});
