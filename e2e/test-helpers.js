/**
 * Shared test helpers for E2E tests
 * Provides consistent cookie consent handling and navigation utilities
 */

/**
 * Handles cookie consent dialog if it appears (reactive approach)
 * Waits for the cookie consent dialog to appear and dismisses it by clicking "Accept All"
 *
 * @param {Page} page - Playwright page object
 *
 * @example
 * test("example test", async ({ page }) => {
 *   await page.goto("/");
 *   await handleCookieConsent(page);
 *   // Dialog has been handled if it appeared
 * });
 */
export async function handleCookieConsent(page) {
  try {
    const cookieOverlay = page.locator("#cookie-consent-overlay");
    // Wait up to 5 seconds for the cookie dialog to appear
    await cookieOverlay.waitFor({ timeout: 5000, state: "visible" });

    // Click the "Accept All" button
    const acceptButton = page.locator('button:has-text("Accept All")');
    await acceptButton.click();

    // Wait for the dialog to disappear
    await cookieOverlay.waitFor({ timeout: 10000, state: "hidden" });

    // Add a small delay to ensure the DOM is stable
    await page.waitForTimeout(500);
  } catch {
    // If no cookie dialog appears within timeout, continue
    console.log("No cookie dialog found or already handled");
  }
}

/**
 * Ensures mobile menu is open (for mobile viewport tests)
 *
 * @param {Page} page - Playwright page object
 *
 * @example
 * await ensureMobileMenuOpen(page);
 * await page.click('a[href="#services"]');
 */
export async function ensureMobileMenuOpen(page) {
  const menuToggle = page.locator(".menu-toggle");
  if (await menuToggle.isVisible()) {
    // If menu toggle is visible (mobile view), ensure menu is open
    const navList = page.locator("nav ul");
    if (!(await navList.isVisible())) {
      await menuToggle.click();
      await navList.waitFor({ state: "visible" });
    }
  }
}

/**
 * Clicks navigation link in mobile view (handles hamburger menu)
 *
 * @param {Page} page - Playwright page object
 * @param {string} href - The href attribute of the link to click
 *
 * @example
 * await clickMobileNavLink(page, "#services-title");
 * await expect(page.locator("#services-title")).toBeInViewport();
 */
export async function clickMobileNavLink(page, href) {
  await ensureMobileMenuOpen(page);
  await page.click(`a[href="${href}"]`);
}
