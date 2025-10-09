import { test, expect } from "@playwright/test";

// Helper function to handle cookie consent
async function handleCookieConsent(page) {
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

// Helper function to handle mobile menu navigation
async function ensureMobileMenuOpen(page) {
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

// Helper function to click navigation link in mobile view
async function clickMobileNavLink(page, href) {
  await ensureMobileMenuOpen(page);
  await page.click(`a[href="${href}"]`);
}

test.describe("Theme Switching", () => {
  test("should toggle between light and dark themes", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Check initial theme (should be light by default)
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    // Toggle to dark mode
    const themeToggle = page.locator("#theme-toggle");
    await themeToggle.click();

    // Check dark theme is applied
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Toggle back to light mode
    await themeToggle.click();

    // Check light theme is restored
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("should respect system theme preference on reload", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Switch to dark mode manually
    const themeToggle = page.locator("#theme-toggle");
    const html = page.locator("html");

    await themeToggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Reload page - should return to system preference (light by default)
    await page.reload();

    // Handle cookie consent again after reload
    await handleCookieConsent(page);

    // Should return to system preference (light)
    await expect(html).toHaveAttribute("data-theme", "light");

    // Test with system dark mode preference
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await handleCookieConsent(page);

    // Should respect system dark mode preference
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("should handle theme switching with keyboard", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Focus on theme toggle directly (more reliable than tabbing)
    const themeToggle = page.locator("#theme-toggle");
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();

    // Press Enter to toggle theme
    await page.keyboard.press("Enter");

    // Check dark theme is applied
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Press Enter again to toggle back
    await page.keyboard.press("Enter");
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("should apply theme to all page elements", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Switch to dark mode
    await page.click("#theme-toggle");

    // Wait for theme change
    await page.waitForTimeout(100);

    // Check various elements have dark theme styling
    const footer = page.locator("footer");
    const body = page.locator("body");

    // Verify dark mode is applied to HTML
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Check that elements are visible and properly styled in dark mode
    await expect(footer).toBeVisible();
    await expect(body).toBeVisible();

    // Switch back to light mode
    await page.click("#theme-toggle");

    // Verify elements are still visible in light mode
    await expect(footer).toBeVisible();
    await expect(body).toBeVisible();
  });

  test("should respect system dark mode preference", async ({ page }) => {
    // Set system to prefer dark mode
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Wait for theme to load
    await page.waitForTimeout(100);

    const html = page.locator("html");
    // Should respect system preference and use dark theme
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("should maintain theme across navigation", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Switch to dark mode
    await page.click("#theme-toggle");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Navigate to different sections (with mobile menu handling)
    await clickMobileNavLink(page, "#services-title");
    await expect(page.locator("#services-title")).toBeInViewport();

    // Theme should still be dark
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Navigate to about section (with mobile menu handling)
    await clickMobileNavLink(page, "#about-title");
    await expect(page.locator("#about-title")).toBeInViewport();

    // Theme should still be dark
    await expect(html).toHaveAttribute("data-theme", "dark");
  });
});

test.describe("Theme Visual Tests", () => {
  // Visual regression tests to ensure consistent theming across browsers
  // Note: Run with --update-snapshots to regenerate baseline images after UI changes

  test("should have consistent styling in light mode", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Ensure we're in light mode
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    // Wait for any animations/transitions to complete
    await page.waitForTimeout(300);

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("light-theme.png", {
      // Increased threshold for minor rendering differences across environments
      threshold: 0.1,
    });
  });

  test("should have consistent styling in dark mode", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Switch to dark mode
    await page.click("#theme-toggle");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Wait for theme transition to complete
    await page.waitForTimeout(300);

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot("dark-theme.png", {
      // Increased threshold for minor rendering differences across environments
      threshold: 0.1,
    });
  });

  test("should handle theme transitions smoothly", async ({ page }) => {
    await page.goto("/");

    // Handle cookie consent
    await handleCookieConsent(page);

    // Get theme toggle
    const themeToggle = page.locator("#theme-toggle");

    // Toggle theme multiple times rapidly
    for (let i = 0; i < 3; i++) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Final state should be dark (odd number of clicks)
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Navigation should still work (with mobile menu handling)
    await clickMobileNavLink(page, "#services-title");
    await expect(page.locator("#services-title")).toBeInViewport();
  });
});
